/*
An assortment of scripts in JavaScript using the jQuery API to increase
the visual appeal of the meteotools.com website.
*/

// -----------------------------------------------------------------------------------------------------------

// Scripts for the buttons on the menu:

function button() {
    $('.menu').hover(
        function() {
            $(this).css({"color": "#a4add3", "background-color": "#cb2c31", "cursor": "pointer"});
        },
        function() {
            $(this).css({"color": "black", "background-color": "#a4add3"});
        }
    ),
    // Special jQuery for the menu option that corresponds to the current page
    $('#thermo').hover(
        function() {
            $(this).css({"color": "black", "background-color": "#a4add3", "cursor": "pointer"});
        },
        function() {
            $(this).css({"color": "#a4add3", "background-color": "#cd2c31"});
        }
    ),
    $('.current_menu').click(
        function() {
            window.location.href="C:/Users/Shawn/Documents/Python_Stuff/Meteo_tools_page/ShawnMurd.github.io-Integrate_jQuery/index.html";
        }
    ),
    $('#vap_prs').click(
        function() {
            window.location.href="C:/Users/Shawn/Documents/Python_Stuff/Meteo_tools_page/ShawnMurd.github.io-Integrate_jQuery//vap_prs.html";
        }
    ),
    $('#moisture').click(
        function() {
            window.location.href="C:/Users/Shawn/Documents/Python_Stuff/Meteo_tools_page/ShawnMurd.github.io-Integrate_jQuery//moisture.html";
        }
    ),
    $('#temperature').click(
        function() {
            window.location.href="C:/Users/Shawn/Documents/Python_Stuff/Meteo_tools_page/ShawnMurd.github.io-Integrate_jQuery//temperature.html";
        }
    )
};

// Execute the command when the page is loaded
$(document).ready(button);

// ------------------------------------------------------------------------------------------------------------
