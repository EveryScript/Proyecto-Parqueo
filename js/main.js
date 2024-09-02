'use strict'
$(document).ready(function () {

  // Llave de acceso - 123456789
  const main_key_a = 'parqueo123456';
  const main_key_b = '{"iv":"27HchFkkIYsn9zRGZA3+Bw==","v":1,"iter":10000,"ks":128,"ts":64,"mode":"ccm","adata":"","cipher":"aes","salt":"af7PNmi75R8=","ct":"OhMaIQZHe76bdqhFt2Qzhuk="}';

  // Default user access
  if (localStorage.getItem("login") == null || localStorage.getItem("login") == undefined) {
    localStorage.setItem("login", false);
  }
  verifyLogin(localStorage.getItem("login"));

  // ----- L O G I N -----
  // Login password
  $('#pass-error').hide();
  $('#login-form').submit(function (e) {
    e.preventDefault();
    var password = $('#password').val();
    // var pass_crypt = sjcl.encrypt(main_key_a, password);
    var pass_decrypt = sjcl.decrypt(main_key_a, main_key_b);
    if (password === pass_decrypt) {
      localStorage.setItem("login", main_key_b);
      verifyLogin(localStorage.getItem("login"));
    } else {
      $('#pass-error').show();
    }
  });
  // Verify login user
  function verifyLogin(value) {
    if (value == "false") {
      $("#loginForm").show();
      $("#panelForm").hide();
    } else {
      $("#loginForm").hide();
      $("#panelForm").show();
    }
  };

  // ----- R E G I S T E R -----
  // Set time init
  $("#btn-register").click(function (e) {
    e.preventDefault();
    $("#id-car-giant").html("...-...");
    var now_register = new Date();
    var time_register = (now_register.getHours() < 10 ? '0' + now_register.getHours() : now_register.getHours()) + ':' + (now_register.getMinutes() < 10 ? '0' + now_register.getMinutes() : now_register.getMinutes());
    $("#hour-register").val(time_register);
  });
  // Save in localstorage
  $("#register-form").submit(function (e) {
    e.preventDefault();
    var actual_list = localStorage.getItem("car_list");
    var new_car = {
      id: $("#id-car").val().toUpperCase(),
      hour_init: $("#hour-register").val(),
      hour_finish: "--:--",
      price: 0
    };
    if (actual_list == null || actual_list == undefined) {
      var array_list = [];
    } else {
      array_list = JSON.parse(actual_list);
    }
    array_list.push(new_car);
    localStorage.setItem("car_list", JSON.stringify(array_list));
    $("#id-car").val("");
    $("#registerModal").modal("hide");
    generateTicket(new_car);
    readingData();
  });

  // ----- R E A D I N G ----
  readingData();
  function readingData() {
    var read_list = localStorage.getItem("car_list");
    var disabled_flag = false;
    if (read_list == null || read_list == undefined) {
      $("#data-pending-area").html('<tr> <td colspan="5" class="font-italic text-center"> No hay vehiculos registrados </td> </tr>');
      $("#data-completed-area").html('<tr> <td colspan="5" class="font-italic text-center"> No hay vehiculos registrados </td> </tr>');
      disabled_flag = true;
    } else {
      $("#data-pending-area").html('');
      $("#data-completed-area").html('');
      var read_array = JSON.parse(read_list);
      var content_pending = ``;
      var content_completed = ``;
      read_array.sort(function (a, b) {
        return a.hour_init >= b.hour_init ? -1 : 1;
      });
      var total_price = 0;
      read_array.forEach(element => {
        var content = `<tr>
        <th scope="row">${element.id}</th>
        <td class="text-center">${element.hour_init}</td>
        <td class="text-center">${element.hour_finish}</td>`;
        if (element.hour_finish == "--:--") {
          content_pending += content + `
            <td class="text-center">${element.price}</td>
            <td class="text-center">
              <button class="btn btn-sm btn-warning" data-toggle="modal" data-target="#completeModal" id="complete-car" data-id-car="${element.id}"> <i class="bi bi-dash-circle-fill"></i> Finalizar </button>
          </td></tr>`;
        } else {
          var result = calculeDiferencePrice(element.hour_init, element.hour_finish);
          total_price += result.price;
          content_completed += content + `<td class="text-center">${result.difference}</td><td class="text-center"><strong>${element.price} Bs.</strong></td></tr>`;;
        }
      });
      if (content_pending == ``) {
        disabled_flag = true;
        content_pending += `<tr> <td colspan="5" class="font-italic text-center"> No hay vehiculos registrados </td> </tr>`;
      }
      if (content_completed == ``) {
        content_completed = '<tr> <td colspan="5" class="font-italic text-center"> No hay vehiculos registrados </td> </tr>';
      }
      content_completed = content_completed + `<tr class="text-success"> <th colspan="4" scope="row"> TOTAL </th> <td class="text-center"> <strong> ${total_price} Bs. </strong> </td> </tr>`;
      disabled_flag ? $("#btn-generate-report").removeClass("disabled") : $("#btn-generate-report").addClass("disabled");

      $("#data-pending-area").html(content_pending);
      $("#data-completed-area").html(content_completed);
    }
  }
  function calculeDiferencePrice(hour_a, hour_b) {
    var hora1 = (hour_a).split(":");
    var hora2 = (hour_b).split(":");
    var t1 = new Date();
    var t2 = new Date();
    t1.setHours(hora1[0], hora1[1]);
    t2.setHours(hora2[0], hora2[1]);
    t1.setHours(t2.getHours() - t1.getHours(), t2.getMinutes() - t1.getMinutes());
    var diff_text = (t1.getHours() ? t1.getHours() + (t1.getHours() > 1 ? " horas" : " hora") : "") + (t1.getMinutes() ? " " + t1.getMinutes() + (t1.getMinutes() > 1 ? " minutos" : " minuto") : "");
    // Price algorithm
    var diff_price = 5;
    t1.getHours() > 0 ? diff_price * t1.getHours() : diff_price * 1;
    t1.getMinutes() > 45 ? diff_price++ : diff_price * 1;
    var diference_object = { difference: diff_text, price: diff_price };
    return diference_object;
  }

  // ----- F I N I S H I N G -----
  // Open modal to confirm
  $(document).on("click", "td > #complete-car", function (e) {
    e.preventDefault();
    localStorage.setItem("id-car", $(this).data('id-car'));
    $("#finish-giant").html($(this).data('id-car'));
  });
  // Finish element
  $("#finish-item").click(function (e) {
    e.preventDefault();
    var update_list = JSON.parse(localStorage.getItem("car_list"));
    var now_complete = new Date();
    var finish_hour = (now_complete.getHours() < 10 ? '0' + now_complete.getHours() : now_complete.getHours()) + ':' + (now_complete.getMinutes() < 10 ? '0' + now_complete.getMinutes() : now_complete.getMinutes())
    update_list.map(element => {
      if (element.id == localStorage.getItem("id-car")) {
        element.hour_finish = finish_hour;
        var result = calculeDiferencePrice(element.hour_init, finish_hour);
        element.price = result.price;
      }
      return element;
    });
    localStorage.setItem("car_list", JSON.stringify(update_list));
    $("#completeModal").modal("hide");
    readingData();
  });

  // ----- T I C K E T  P D F -----
  function generateTicket(array_cars) {
    window.jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [50, 15] });
    var date_file = new Date();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text('EMPRESA "LOREM IPSUM"', 25, 5, null, null, "center");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(array_cars.id+' - Hrs: '+array_cars.hour_init, 25, 10, null, null, "center");
    doc.save(date_file.getFullYear()+date_file.getMonth()+date_file.getDate()+'_'+date_file.getHours()+date_file.getMinutes()+date_file.getSeconds());
  }
  // ----- E X P O R R T  P D F -----
  $("#btn-generate-report").click(function (e) {
    if(!$(this).hasClass("disabled")) {
      e.preventDefault();
      var date_rep = new Date();
      window.jsPDF = window.jspdf.jsPDF;
      var doc = new jsPDF();
      doc.text("Reporte de autos", 20, 20);
      doc.save('Reporte'+date_rep.getFullYear()+date_rep.getMonth()+date_rep.getDate());
    }
  });
});

/*
function downloadCSV(csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], {type: "text/csv"});

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

function parseCSV(text) {
    // Obtenemos las lineas del texto
    let lines = text.replace(/\r/g, '').split('\n');
    return lines.map(line => {
      // Por cada linea obtenemos los valores
      let values = line.split(',');
      return values;
    });
  }
  
  function reverseMatrix(matrix){
    let output = [];
    // Por cada fila
    matrix.forEach((values, row) => {
      // Vemos los valores y su posicion
      values.forEach((value, col) => {
        // Si la posición aún no fue creada
        if (output[col] === undefined) output[col] = [];
        output[col][row] = value;
      });
    });
    return output;
  }
  
  function readFile(evt) {
    let file = evt.target.files[0];
    let reader = new FileReader();
    reader.onload = (e) => {
      // Cuando el archivo se terminó de cargar
      let lines = parseCSV(e.target.result);
      let output = reverseMatrix(lines);
      console.log(output);
    };
    // Leemos el contenido del archivo seleccionado
    reader.readAsBinaryString(file);
  }
  
document.getElementById('file').addEventListener('change', readFile, false); */