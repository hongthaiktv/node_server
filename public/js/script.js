"use strict";

$.ajaxSetup({contentType: "application/json",
    error: (xhr) => {
        try {
            let errObj = JSON.parse(xhr.responseText);
            toastr.error(errObj.message);
            if (errObj.error && errObj.error.code && errObj.error.cmd) {
                console.error("JQuery Ajax: Error code:", errObj.error.code + ",", "Command:", errObj.error.cmd);
                $('#console-log').append(`<div class="danger-color-dark">Error code: ${errObj.error.code}, Command: ${errObj.error.cmd}</div>`);
            } else {
                console.error("JQuery Ajax: Error code:", errObj.error);
                $('#console-log').append(`<div class="danger-color-dark">${errObj.error}</div>`);
            }
            $("#inpKey").val("");
            $('#console-log').scrollTop($('#console-log')[0].scrollHeight);
        } catch (error) {
            console.error("JQuery Ajax:", "Can't parse error, not json type.");
            console.error("JQuery Ajax:", xhr.responseText);
            $('#console-log').append(`<div class="danger-color-dark">${xhr.responseText}</div>`);
            $("#inpKey").val("");
            $('#console-log').scrollTop($('#console-log')[0].scrollHeight);
        }
    }
});

const APPSETTING = {
    domain: window.location.href,
    token: ""
};


async function hashPassword(password) {
  const encUint8 = new TextEncoder().encode(password); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", encUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

$.post(APPSETTING.domain, function (data) {
	$('#sshdUpTime').html(data[0].upTime);
});

setInterval(() => {
    $.post(APPSETTING.domain,
    function (data) {
        $('#sshdUpTime').html(data[0].upTime);
    });
}, 60000);

$('#btnSubmit').click(async function (e) { 
    e.preventDefault();
    let inpCmd = $('#inpKey').val();
    let cmdObj = {};

    if (inpCmd) {
        if (APPSETTING.token === "") {
            cmdObj.token = await hashPassword(inpCmd);
            cmdObj.reqLogin = true;
        } else {
            cmdObj.token = APPSETTING.token;
            cmdObj.command = inpCmd;
        }
	
        $.post(`${APPSETTING.domain}run`, JSON.stringify(cmdObj),
        function (data) {
            if (APPSETTING.token === "") {
                APPSETTING.token = cmdObj.token;
                Object.freeze(APPSETTING);
                $("#inpKey").attr("type", "text").prev().removeClass("fa-lock").addClass("fa-keyboard").siblings("label").html("Enter your command");
                $("#inpKey").val("").blur();
		$('#inpKeyHelp').html('Ex: ./bin/curl --cacert ./certs/ca-certificates.crt https://example.com -o /tmp/example.html');
		$('#btnSubmit').html('<i class="fas fa-running mr-2"></i> Run');
                $('#console-log').append(`<div class="success-color-dark">${data.message}</div>`);
            } else {
                $('#console-log').append(`<div>---------- ${new Date().toLocaleString()} ----------<br>${data.stdout}</div>`);
                $('#console-log').scrollTop($('#console-log')[0].scrollHeight);
                $("#inpKey").val("");
            }
        });
    }
});

$('#inpKey').keydown(function (e) {
    if (e.code === 'Enter') $('#btnSubmit').click();
});

