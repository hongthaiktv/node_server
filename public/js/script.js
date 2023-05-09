"use strict";

$.ajaxSetup({contentType: "application/json",
    error: (xhr) => {
        try {
            let errObj = JSON.parse(xhr.responseText);
            if (errObj.message) toastr.error(errObj.message);
            if (errObj.error && errObj.error.code && errObj.error.cmd) {
                console.error("JQuery Ajax: Error code:", errObj.error.code + ",", "Command:", errObj.error.cmd);
                $('#console-log').append(`<div class="danger-color-dark">---------- ${new Date().toLocaleString()} ----------<br>Error code: ${errObj.error.code}, Command: ${errObj.error.cmd}</div>`);
            } else {
                console.error("JQuery Ajax: Error:", errObj.error);
                $('#console-log').append(`<div class="danger-color-dark">---------- ${new Date().toLocaleString()} ----------<br>${errObj.error}</div>`);
            }
            $("#inpKey").val("");
            $('#console-log').scrollTop($('#console-log')[0].scrollHeight);
        } catch (error) {
            console.error("JQuery Ajax:", "Can't parse error, not json type.");
            console.error("JQuery Ajax:", xhr.responseText);
            $('#console-log').append(`<div class="danger-color-dark">---------- ${new Date().toLocaleString()} ----------<br>${xhr.responseText}</div>`);
            $("#inpKey").val("");
            $('#console-log').scrollTop($('#console-log')[0].scrollHeight);
        }
    }
});

const APPSETTING = {
    token: ""
};
var cmdHistory = {cmdList: [], current: 0};


async function hashPassword(password) {
  const encUint8 = new TextEncoder().encode(password); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", encUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

$.post("/", function (data) {
	$('#sshdUpTime').html(data[0].upTime);
});

setInterval(() => {
    $.post("/",
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
	
        $.post("/run", JSON.stringify(cmdObj),
        function (data) {
            if (APPSETTING.token === "") {
                APPSETTING.token = cmdObj.token;
                Object.freeze(APPSETTING);
                $("#inpKey").attr("type", "text").prev().removeClass("fa-lock").addClass("fa-keyboard").siblings("label").html("Enter your command");
                $("#inpKey").val("").blur();
		        $('#inpKeyHelp').html('Ex: ./bin/curl --cacert ./certs/ca-certificates.crt https://example.com -o /tmp/example.html');
		        $('#btnSubmit').html('<i class="fas fa-running mr-2"></i> Run');
                $('#console-log').append(`<div class="success-color-dark">---------- ${new Date().toLocaleString()} ----------<br>${data.message}</div>`);
            } else {
                cmdHistory.cmdList.push(inpCmd);
                $('#console-log').append(`<div>---------- ${new Date().toLocaleString()} ----------<br>${data.stdout}</div>`);
                $('#console-log').scrollTop($('#console-log')[0].scrollHeight);
                $("#inpKey").val("");
            }
        });
    }
});

$('#inpKey').keydown(function (e) {
    switch (e.keyCode) {
        case 13:
            $('#btnSubmit').click();
            break;
        case 38:
            cmdHistory.current++;
            if (cmdHistory.cmdList.length <= cmdHistory.current) {
                $("#inpKey").val(cmdHistory.cmdList[cmdHistory.cmdList.length - cmdHistory.current]);
            } else cmdHistory.current = cmdHistory.cmdList.length;
            break;
        case 40:
            cmdHistory.current--;
            if (cmdHistory.cmdList.length >= 1) {
                $("#inpKey").val(cmdHistory.cmdList[cmdHistory.cmdList.length - cmdHistory.current]);
            } else cmdHistory.current = 1;
            break;
        default:
            break;
    }
});

