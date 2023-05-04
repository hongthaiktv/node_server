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
let data = {name: "value"};


const text =
  "An obscure body in the S-K System, your majesty. The inhabitants refer to it as the planet Earth.";

async function digestMessage(message) {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(""); // convert bytes to hex string
  return hashHex;
}




async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  toastr.info(hash.toString());
  return hash;
}

setInterval(() => {
    $.post("http://localhost:3000/test", JSON.stringify(data),
    function (data) {
        $('#sshdUpTime').html(data.counter);
    });
}, 1000);

$('#btnSubmit').click(function (e) { 
    e.preventDefault();
    let inpCmd = $('#inpKey').val();
    let cmdObj = {};

    //hashPassword(inpCmd);
    digestMessage(inpCmd).then((digestHex) => toastr.info(digestHex));
    if (TOKEN === "") cmdObj.token = inpCmd;
    else {
        cmdObj.token = TOKEN;
        cmdObj.command = inpCmd;
    }

    $.post(`http://localhost:3000/run`, JSON.stringify(cmdObj),
    function (data) {
        if (TOKEN === "") {
            TOKEN = inpCmd;
            $("#inpKey").attr("type", "text").prev().removeClass("fa-lock").addClass("fa-keyboard").siblings("label").html("Enter your command");
            $("#inpKey").val("").blur();
            console.log(data.message);
        } else {
            console.log(data.stdout);
            toastr.success(data.message);
        }
    });
});

