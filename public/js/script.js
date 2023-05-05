$.ajaxSetup({contentType: "application/json",
    error: (xhr) => {
        try {
            let errObj = JSON.parse(xhr.responseText);
            toastr.error(errObj.error);
            console.error("JQuery Ajax:", errObj.error);
        } catch (error) {
            console.error("JQuery Ajax:", "Can't parse error, not json type.");
            console.error("JQuery Ajax:", xhr.responseText);
        }
    }
});

var TOKEN = "";


async function hashPassword(password) {
  const encUint8 = new TextEncoder().encode(password); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", encUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}

setInterval(() => {
    $.post("http://localhost:3000/test",
    function (data) {
        $('#sshdUpTime').html(data.counter);
    });
}, 1000);

$('#btnSubmit').click(async function (e) { 
    e.preventDefault();
    let inpCmd = $('#inpKey').val();
    let cmdObj = {};

    if (inpCmd) {
        if (TOKEN === "") {
            cmdObj.token = await hashPassword(inpCmd);
            cmdObj.reqLogin = true;
        } else {
            cmdObj.token = TOKEN;
            cmdObj.command = inpCmd;
        }
        $.post(`https://remote.cyclic.app/run`, JSON.stringify(cmdObj),
        function (data) {
            if (TOKEN === "") {
                TOKEN = cmdObj.token;
                $("#inpKey").attr("type", "text").prev().removeClass("fa-lock").addClass("fa-keyboard").siblings("label").html("Enter your command");
                $("#inpKey").val("").blur();
                $('#console-log').html(`<div>${data.message}</div>`);
            } else {
                let oldLog = $('#console-log').html();
                let newLog = data.stdout ? oldLog ? $('#console-log').html() + `<div>${data.stdout}</div>` : `<div>${data.stdout}</div>` : "";
                if (newLog) {
                    $('#console-log').html(newLog);
                    $('#console-log').scrollTop($('#console-log')[0].scrollHeight);
                }
            }
        });
    }
});

