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

