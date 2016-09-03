/*
An assortment of scripts in JavaScript using the jQuery API to increase
the visual appeal of the meteotools.com website.
*/


// Scripts for the buttons on the menu:

function button() {
    $(.menu).hover(
        function() {
            $(this).css({"color": "#a4add3", "background-color": "#cb2c31", "cursor": "pointer"});
        },
        function() {
            $(this).css({"color": "black", "background-color": "#a4add3"});
        }
    ),
    $(#thermo).click(
        function() {
            window.location.href="http://meteotools.com";
        }
    ),
    $(#vap_prs).click(
        function() {
            window.location.href="http://meteotools.com/vap_prs.html";
        }
    ),
    $(#moisture).click(
        function() {
            window.location.href="http://meteotools.com/moisture.html";
        }
    ),
    $(#temperature).click(
        function() {
            window.location.href="http://meteotools.com/temperature.html";
        }
    )
};

$(document).ready(button);
