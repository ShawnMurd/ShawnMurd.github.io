/* 
JavaScript scripts for MeteoTools page
Note: Most of these scripts are mirrored in the thermo_scripts.py file
*/


// Basic Conversions:

function FtoK(temp) {
	// Converts temperature from Fahrenheit to Kelvin
	return (temp - 32) * (5/9) + 273.15;
}
 
function KtoF(temp) {
	// Converts temperature from Kelvin to Fahrenheit
	return (9/5) * (temp - 273.15) + 32;
}

function inHgToMb(prs) {
	// Converts pressure from inches of Mercury to Millibars
  	return (1013.25/29.92) * prs;
}

function mmHgToMb(prs) {
	// Converts pressure from millimeters of Mercury to Millibars
  	return (1013.25/760) * prs;
}

function MbtoinHg(prs) {
	// Converts pressure from Millibars to inches of Mercury
  	return (29.92/1013.25) * prs;
}

function MbtommHg(prs) {
	// Converts pressure from Millibars to millimeters of Mercury
  	return (760/1013.25) * prs;
}


// Moisture-related scripts:

function e_s(T) {
	/*
	Calculates the equilibrium vapor pressure (Pa) at temperature T (K) using
  	the Clausius-Clapeyron Equation.
  	Inputs:
  		T = Temperature (K)
  	Outputs:
		evp = Equilibrium vapor pressure (Pa)
  	Local Variables:
  	   	lv = Enthalpy of vaporization (J/kg)
  	   	Rv = Gas constant for water vapor (J/kg*K)
	*/
	
	var lv = 2.5 * (Math.pow(10, 6));
	var Rv = 461.5;
	var evp = 611*Math.exp((lv/Rv)*((1/273.15) - (1/T)));
	return evp;
}

function RHtoDewK(T, RH) {
	/*
	Converts a relative humidity to a dew point
  	Inputs:
  		T = Temperature (K)
  		RH = Relative humidity (as a decimal)
  	Outputs:
  		Td = Dew point (K)
  	Local Variables:
  		Rv = Gas constant for water vapor (J/kg*K)
  		lv = Enthalpy of vaporization (J/kg)
  	    e = Vapor pressure (Pa)
	*/
  
	var lv = 2.5 * (Math.pow(10, 6));
	var Rv = 461.5;
	var e = RH * e_s(T);
	var Td = 1/(1/273.15 - (Rv/lv)*Math.log(e/611.0));
	return Td;
}

function MixToTd(mix, P) {
    /*
    Returns the dew point given the mixing ratio and pressure. Vapor pressure is
    calculated using equation 5.14 in Bohren's "Atmospheric Thermodynamics".
    Inputs:
        mix = Mixing ratio (kg/kg, unitless)
        P = Pressure (Pa)
    Outputs:
        Td = Dew point (K)
    Local Variables:
        Rv = Gas constant for water vapor (J/kg*K)
        lv = Enthalpy of vaporization (J/kg)
        epn = Ratio of molar mass of water vapor to molar mass of dry air
        e = Vapor pressure (Pa)
    */
    
    var lv = 2.5 * (Math.pow(10, 6));
    var Rv = 461.5;
    var epn = 0.622;
    var e = (mix * P) / (mix + epn);
    var Td = Td = 1/(1/273.15 - (Rv/lv)*Math.log(e/611.0));
    return Td;
}

function mixing(Td, P) {
    /*
    Calculates the mixing ratio given a dew point and a pressure using equation
    5.14 in Bohren's "Atmospheric Thermodynamics".
    Inputs:
        Td = Dew point (K)
        P = Pressure (Pa)
    Outputs:
        w = Mixing ratio (kg/kg, unitless)
    Local Variables:
        epn = Ratio of molar mass of water vapor to molar mass of dry air
    */

    var epn = 0.622;
    var w = epn * (e_s(Td) / (P - e_s(Td)));
    return w;
}


// Main Thermodynamics Script:

function thermo() {
    /*
    Retrieves the inputs and desired output format from the HTML document and
    then calculates the potential temperature, equivalent potential temperature
    saturated equivalent potential temperature, wet-bulb potential temperature,
    LCL pressure, LCL temperature, mixing ratio, relative humidity, dew point,
    virtual temperature, and equivalent temperature. Essentially, this is a
    combination of several of the scripts found in the thermo_scripts.py python
    file.
    */
    
    // Obtain input values
    var temp = parseFloat(document.getElementById("temp").value);
    var prs = parseFloat(document.getElementById("prs").value);
    var mois = parseFloat(document.getElementById("moisture").value);
    var TUnitIn = document.querySelector('input[name="tempunit"]:checked').value;
    var PUnitIn = document.querySelector('input[name="prsunit"]:checked').value;
    var MUnitIn = document.querySelector('input[name="moisunit"]:checked').value;
    var TUnitOut = document.querySelector('input[name="tempout"]:checked').value;
    var PUnitOut = document.querySelector('input[name="prsout"]:checked').value;
   
    // Make necessary conversions to get units of Kelvin and Pascals
    // Convert Temperature to Kelvin
    if (TUnitIn === "degF") {
        temp = FtoK(temp);
    }
    else if (TUnitIn === "degC") {
        temp = temp + 273.15;
    }
    // Convert Pressure to Pascals
    if (PUnitIn === "mb") {
        prs = prs * 100.0;
    }
    else if (PUnitIn === "inHg") {
        prs = inHgToMb(prs) * 100.0;
    }
    else if (PUnitIn === "mmHg") {
        prs = mmHgToMb(prs) * 100.0;
    }
    // Convert Moisture Measure to Dew Point (K)
    if (MUnitIn === "dewF") {
        mois = FtoK(mois);
    }
    else if (MUnitIn === "dewC") {
        mois = mois + 273.15;
    }
    else if (MUnitIn === "RH") {
        mois = RHtoDewK(temp, mois);
    }
    else if (MUnitIn === "w") {
        mois = MixToTd(mois, prs);
    }
    
    // Define Local Variables
    var Rd = 287.04;
    var cp = 1005.0;
    var epn = 0.622;
    var lv = 2.5 * Math.pow(10, 6);
    var cw = 4218.0;
    
    // Calculate LCL Pressure and Temperature
    // Check for condition where T = Td
    if (temp === mois) {
        var Plcl = prs;
        var Tlcl = temp;
    }
    else {
        // Calculate surface vapor pressure, mixing ratio:
        var eSfc = e_s(mois);
        var w = (epn*eSfc) / (prs - eSfc);
        
        // Find T_lcl such that w_sfc - w_s(T_lcl) = 0
        var Tup = temp;
        var Pup = Math.pow((Tup/temp), (cp/Rd)) * prs;
        var upper = w - ((epn*e_s(Tup)) / (Pup - e_s(Tup)));
        var Tlow = 150.0;
        var Plow = Math.pow((Tlow/temp), (cp/Rd)) * prs;
        var lower = w - ((epn*e_s(Tlow)) / (Plow - e_s(Tlow)));
        
        var n = 0
        while (Math.abs(Math.abs(upper) - Math.abs(lower)) > 0.000001) {
            var Tmid = (Tup/2)+(Tlow/2); 
            var Pmid = Math.pow((Tmid/temp), (cp/Rd)) * prs;
            var middle = w - ((epn*e_s(Tmid)) / (Pmid - e_s(Tmid)));
            if ((upper > 0 && middle < 0) || (upper < 0 && middle > 0)) {
                Tlow = Tmid;
            }
            else {
                Tup = Tmid;
            }
            Pup = Math.pow((Tup/temp), (cp/Rd)) * prs;
            upper = w - ((epn*e_s(Tup)) / (Pup - e_s(Tup)));
            Plow = Math.pow((Tlow/temp), (cp/Rd)) * prs;
            lower = w - ((epn*e_s(Tlow)) / (Plow - e_s(Tlow)));
            n = n + 1;
            if (n > 50) {
                alert("An Error Has Occurred. Check your input values.");
                break;
            }
        }
        Tlcl = 0.5*(Tlow + Tup);
        
        // Find P_lcl using Poisson's Relations
        Plcl = Math.pow((Tlcl/temp), (cp/Rd)) * prs;
    }
    
    // Calculate Potential Temperature
    var thet = temp * Math.pow((100000.0/prs), (Rd/cp));
    
    // Calculate Equivalent Potential Temperature
    var w_s = mixing(Tlcl, Plcl);
    var e_lcl = e_s(Tlcl);
    var thet_d = Tlcl * Math.pow((100000.0 / (Plcl - e_lcl)), (Rd/cp));
    var thet_e = thet_d * Math.exp((lv * w_s) / (cp * Tlcl));
    
    // Calculate Saturated Equivalent Potential Temperature
    w = mixing(temp, prs);
    e_lcl = e_s(temp);
    thet_d = temp * Math.pow((100000.0 / (prs - e_lcl)), (Rd /cp));
    var thet_es = thet_d * Math.exp((lv * w) / (cp * temp));
    
    // Calculate Wet-Bulb Potential Temperature
    w_s = mixing(Tlcl, Plcl);
    e_lcl = e_s(Tlcl);
    thet_d = Tlcl * Math.pow((100000.0 / (Plcl - e_lcl)), (Rd /cp));

    // Find thet_wb using method of bisections:
    var thet_wb_up = 100.0;
    var w_s_up = mixing(thet_wb_up, 100000.0);
    w = mixing(mois, prs);
    upper = (thet_d * Math.exp((lv/cp) * ((w/Tlcl) - (w_s_up/thet_wb_up))) -
             thet_wb_up);
    var thet_wb_low = thet_d;
    var w_s_low = mixing(thet_wb_low, 100000.0);
    lower = (thet_d * Math.exp((lv/cp) * ((w/Tlcl) - (w_s_low/thet_wb_low))) -
             thet_wb_low);

    while (Math.abs(Math.abs(upper) - Math.abs(lower)) > 0.000001) {
        var thet_wb_mid = 0.5*(thet_wb_up + thet_wb_low);
        var w_s_mid = mixing(thet_wb_mid, 100000.0);
        middle = (thet_d * Math.exp((lv/cp) * ((w/Tlcl) - (w_s_mid/thet_wb_mid))) -
                  thet_wb_mid);
        if ((upper > 0 && middle < 0) || (upper < 0 && middle > 0)) {
            thet_wb_low = thet_wb_mid;
        }
        else {
            thet_wb_up = thet_wb_mid;
        }
        w_s_up = mixing(thet_wb_up, 100000.0);
        upper = (thet_d * Math.exp((lv/cp) * ((w/Tlcl) - (w_s_up/thet_wb_up))) -
                 thet_wb_up);
        w_s_low = mixing(thet_wb_low, 100000.0);
        lower = (thet_d * Math.exp((lv/cp) * ((w/Tlcl) - (w_s_low/thet_wb_low))) -
                 thet_wb_low);
    }
    thet_wb = 0.5*(thet_wb_low + thet_wb_up);
    
    // Calculate Virtual Temperature and Equivalent Temperature
    var T_v = temp * (1 + 0.61*w);
    var T_e = temp + ((lv*w) / (cp + w*cw));
    
    // Calculate Relative Humidity
    var rh = (e_s(mois) / e_s(temp)) * 100;
    
    // Calculate Wet Bulb Temperature
    var T_wb_up = temp;
    var T_wb_low = mois;
    upper = (cp/lv) * (temp - T_wb_up) - mixing(T_wb_up, prs) + w;
    lower = (cp/lv) * (temp - T_wb_low) - mixing(T_wb_low, prs) + w;
    while (Math.abs(Math.abs(upper) - Math.abs(lower)) > 0.000001) {
        var T_wb_mid = 0.5*(T_wb_up + T_wb_low);
        middle = (cp/lv) * (temp - T_wb_mid) - mixing(T_wb_mid, prs) + w;
        if ((upper > 0 && middle < 0) || (upper < 0 && middle > 0)) {
            T_wb_low = T_wb_mid;
        }
        else {
            T_wb_up = T_wb_mid;
        }
        upper = (cp/lv) * (temp - T_wb_up) - mixing(T_wb_up, prs) + w;
        lower = (cp/lv) * (temp - T_wb_low) - mixing(T_wb_low, prs) + w;
    }
    var T_wb = 0.5*(T_wb_low + T_wb_up);
    
    // Make conversions for Output Format
    if (TUnitOut === "degF") {
        thet = KtoF(thet);
        thet_e = KtoF(thet);
        thet_es = KtoF(thet_es);
        thet_wb = KtoF(thet_wb);
        Tlcl = KtoF(Tlcl);
        mois = KtoF(mois);
        T_v = KtoF(T_v);
        T_e = KtoF(T_e);
        T_wb = KtoF(T_wb);
    }
    else if (TUnitOut === "degC") {
        thet = thet - 273.15;
        thet_e = thet_e - 273.15;
        thet_es = thet_es - 273.15;
        thet_wb = thet_wb - 273.15;
        Tlcl = Tlcl - 273.15;
        mois = mois - 273.15;
        T_v = T_v - 273.15;
        T_e = T_e - 273.15;
        T_wb = T_wb - 273.15;
    }
    if (PUnitOut === "inHg") {
        Plcl = MbtoinHg(Plcl / 100);
    }
    else if (PUnitOut === "mmHg") {
        Plcl = MbtommHg(Plcl / 100);
    }
    else {
        Plcl = Plcl / 100;
    }
    
    // Write Results to Page
    document.getElementById("theta").innerHTML = " "+thet.toFixed(2);
    document.getElementById("theta_e").innerHTML = " "+thet_e.toFixed(2);
    document.getElementById("theta_es").innerHTML = " "+thet_es.toFixed(2);
    document.getElementById("theta_wb").innerHTML = " "+thet_wb.toFixed(2);
    document.getElementById("lcl_p").innerHTML = " "+Plcl.toFixed(2);
    document.getElementById("lcl_t").innerHTML = " "+Tlcl.toFixed(2);
    document.getElementById("mix").innerHTML = " "+(w*1000.0).toFixed(2);
    document.getElementById("rh").innerHTML = " "+rh.toFixed(2);
    document.getElementById("dew").innerHTML = " "+mois.toFixed(2);
    document.getElementById("T_v").innerHTML = " "+T_v.toFixed(2);
    document.getElementById("T_e").innerHTML = " "+T_e.toFixed(2);
    document.getElementById("wb").innerHTML = " "+T_wb.toFixed(2);
}


// Main Vapor Pressure Script

function vap_prs() {
    /* Obtains inputs from the vap_prs.html page and then calculates the
    equilibrium vaopr pressure using the Clausius-Clapeyron Equation
    */
    
    // Obtain inputs
    var temp = parseFloat(document.getElementById("temp").value);
    var TUnitIn = document.querySelector('input[name="tempunit"]:checked').value;
    var PUnitOut = document.querySelector('input[name="prsout"]:checked').value;
    
    // Convert temperature if needed
    if (TUnitIn === "degF") {
        temp = FtoK(temp);
    }
    else if (TUnitIn === "degC") {
        temp = temp + 273.15;
    }
    
    // Calculate Vapor Pressure
    var prs = e_s(temp);
    
    // Convert Pressure into desired units
    if (PUnitOut === "mb") {
        prs = prs / 100.0;
    }
    else if (PUnitOut === "inHg") {
        prs = MbtoinHg(prs / 100.0);
    }
    else if (PUnitOut === "mmHg") {
        prs = MbtommHg(prs / 100.0);
    }
    
    // Write Vapor Pressure to page
    document.getElementById("evp").innerHTML = " "+prs.toFixed(2);
}


// Main temperature conversion script

function temp_convert() {
    /* Obtains inputs from the vap_prs.html page and then calculates the
    equilibrium vaopr pressure using the Clausius-Clapeyron Equation
    */
    
    // Obtain inputs
    var temp = parseFloat(document.getElementById("temp").value);
    var TUnitIn = document.querySelector('input[name="tempunit"]:checked').value;
    var TUnitOut = document.querySelector('input[name="tempout"]:checked').value;
    
    // Convert temperature to Kelvin
    if (TUnitIn === "degF") {
        temp = FtoK(temp);
    }
    else if (TUnitIn === "degC") {
        temp = temp + 273.15;
    }
    
    // Convert Temperature into desired units
    if (TUnitOut === "degF") {
        temp = KtoF(temp);
    }
    else if (TUnitOut === "degC") {
        temp = temp - 273.15;
    }
    
    // Write Vapor Pressure to page
    document.getElementById("Tconvert").innerHTML = " "+temp.toFixed(2);
}


// Main Moisture conversion scripts

function RHtoDew1() {
    /* Reads relative humidity and temperature from the html file then
    calculates the dew point for those values.
    */
    
    // Obtain inputs
    var rh = parseFloat(document.getElementById("rh_in1").value);
    var temp = parseFloat(document.getElementById("temp_in1").value);
    var TUnitIn = document.querySelector('input[name="temp1"]:checked').value;
    var DUnitOut = document.querySelector('input[name="dew1"]:checked').value;
    
    // Convert temperature to Kelvin
    if (TUnitIn === "degF") {
        temp = FtoK(temp);
    }
    else if (TUnitIn === "degC") {
        temp = temp + 273.15;
    }
    
    // Calculate Dew Point using fact that rh = e_s(Td)/e_s(T)
    var e = (rh / 100.0) * e_s(temp);
    var lv = 2.5 * Math.pow(10, 6);
    var Rv = 461.5;
    var dew = 1 / ((1/273.15)-(Rv/lv)*Math.log(e/611));
    
    // Convert Dew Point into desired units
    if (DUnitOut === "degF") {
        dew = KtoF(dew);
    }
    else if (DUnitOut === "degC") {
        dew = dew - 273.15;
    }
    
    // Write dew point to page
    document.getElementById("dew_out1").innerHTML = " "+dew.toFixed(2);
}

function DewtoRH2() {
    /* Reads dew point and temperature from the html file then calculates
    the relative humidity for those values.
    */
    
    // Obtain inputs
    var dew = parseFloat(document.getElementById("dew_in2").value);
    var temp = parseFloat(document.getElementById("temp_in2").value);
    var TUnitIn = document.querySelector('input[name="temp2"]:checked').value;
    var DUnitIn = document.querySelector('input[name="dew2"]:checked').value;
    
    // Convert temperature to Kelvin
    if (TUnitIn === "degF") {
        temp = FtoK(temp);
    }
    else if (TUnitIn === "degC") {
        temp = temp + 273.15;
    }
    
    // Convert dew point to Kelvin
    if (DUnitIn === "degF") {
        dew = FtoK(dew);
    }
    else if (DUnitIn === "degC") {
        dew = dew + 273.15;
    }
    
    // Calculate Relative Humidity
    var rh = (e_s(dew) / e_s(temp)) * 100.0;
    
    // Write relative humidity to page
    document.getElementById("rh_out2").innerHTML = " "+rh.toFixed(2);
}

function MixtoDew3() {
    /* Reads mixing ratio and pressure from the html file then calculates the
    dew point for those values.
    */
    
    // Obtain inputs
    var mix = parseFloat(document.getElementById("mix_in3").value);
    var prs = parseFloat(document.getElementById("prs_in3").value);
    var PUnitIn = document.querySelector('input[name="prs3"]:checked').value;
    var DUnitOut = document.querySelector('input[name="dew3"]:checked').value;
    
    // Convert Pressure to Pascals
    if (PUnitIn === "mb") {
        prs = prs * 100.0;
    }
    else if (PUnitIn === "inHg") {
        prs = inHgToMb(prs) * 100.0;
    }
    else if (PUnitIn === "mmHg") {
        prs = mmHgToMb(prs) * 100.0;
    }
    
    // Calculate vapor pressure
    var epn = 0.622;
    mix = mix / 1000.0;
    var e = (mix * prs) / (epn + mix);
    
    // Calculate dew point
    var lv = 2.5 * Math.pow(10, 6);
    var Rv = 461.5;
    var dew = 1 / ((1/273.15)-(Rv/lv)*Math.log(e/611));
    
    // Convert Dew point to desired units
    if (DUnitOut === "degF") {
        dew = KtoF(dew);
    }
    else if (DUnitOut === "degC") {
        dew = dew - 273.15;
    }
    
    // Write dew point to page
    document.getElementById("dew_out3").innerHTML = " "+dew.toFixed(2);
}

function DewtoMix4() {
    /* Reads dew point and pressure from the html file then calculates the
    mixing ratio for those values.
    */
    
    // Obtain inputs
    var dew = parseFloat(document.getElementById("dew_in4").value);
    var prs = parseFloat(document.getElementById("prs_in4").value);
    var PUnitIn = document.querySelector('input[name="prs4"]:checked').value;
    var DUnitIn = document.querySelector('input[name="dew4"]:checked').value;
    
    // Convert Pressure to Pascals
    if (PUnitIn === "mb") {
        prs = prs * 100.0;
    }
    else if (PUnitIn === "inHg") {
        prs = inHgToMb(prs) * 100.0;
    }
    else if (PUnitIn === "mmHg") {
        prs = mmHgToMb(prs) * 100.0;
    }
    
    // Convert dew point to Kelvin
    if (DUnitIn === "degF") {
        dew = FtoK(dew);
    }
    else if (DUnitIn === "degC") {
        dew = dew + 273.15;
    }
    
    // Calculate mixing ratio
    var epn = 0.622;
    var mix = epn * (e_s(dew) / (prs - e_s(dew))) * 1000.0;
    
    // Write dew point to page
    document.getElementById("mix_out4").innerHTML = " "+mix.toFixed(2);
}
