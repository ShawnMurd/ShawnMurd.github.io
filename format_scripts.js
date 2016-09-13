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
    $('.current_menu').hover(
        function() {
            $(this).css({"cursor": "pointer"});
        }
    ),
    $('#thermo_menu').click(
        function() {
            window.location.href="http://ShawnMurd.github.io";
        }
    ),
    $('#vap_prs_menu').click(
        function() {
            window.location.href="http://ShawnMurd.github.io/vap_prs.html";
        }
    ),
    $('#moisture_menu').click(
        function() {
            window.location.href="http://ShawnMurd.github.io/moisture.html";
        }
    ),
    $('#temperature_menu').click(
        function() {
            window.location.href="http://ShawnMurd.github.io/temperature.html";
        }
    )
};

// Execute the command when the page is loaded
$(document).ready(button);

// ------------------------------------------------------------------------------------------------------------
