'use strict'
$(document).ready(function () {
    // Show and hide password
    $('#showhidepass').on('click', function () {
        var passInput = $("#password");
        if (passInput.attr('type') === 'password') {
            passInput.attr('type', 'text');
        } else {
            passInput.attr('type', 'password');
        }
    });
    // Clock to register
    var clock = $("#time");
    var date = $("#date");
    var now_date = new Date();
    var month_text = "";
    switch (now_date.getMonth()) {
        case 0: month_text = "Enero"; break;
        case 1: month_text = "Febrero"; break;
        case 2: month_text = "Marzo"; break;
        case 3: month_text = "Abril"; break;
        case 4: month_text = "Mayo"; break;
        case 5: month_text = "Junio"; break;
        case 6: month_text = "Julio"; break;
        case 7: month_text = "Agosto"; break;
        case 8: month_text = "Septiembre"; break;
        case 9: month_text = "Octubre"; break;
        case 10: month_text = "Noviembre"; break;
        case 11: month_text = "Diciembre"; break;
    }
    date.html(now_date.getDate() + ' de ' + month_text + ' de ' + now_date.getFullYear());
    setInterval(() => {
        var now_time = new Date();
        var hours = now_time.getHours();
        var minutes = now_time.getMinutes();
        var seconds = now_time.getSeconds();
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        var time = hours + ':' + minutes + ':' + seconds;
        clock.html(time);
    }, 1000);
    // SignOut (close sesion)
    $("#btnSignOut").click(function (e) {
        e.preventDefault();
        localStorage.removeItem("login");
        localStorage.setItem("login", false);
        $('#password').val("");
        $("#loginForm").show();
        $("#panelForm").hide();
    });
    // Giant text id-car and no spaces
    $("#id-car").keyup(function (e) { 
        $("#id-car-giant").html($(this).val().toUpperCase());
        var car = $(this).val();
        $(this).val(car.replace(/ /g, ""));
    });
});