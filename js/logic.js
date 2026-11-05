$('#copyBtn').click(function () {
    copyText();
});

function copyText() {
    const text = document.getElementById("password");

    navigator.clipboard.writeText(text.value)
    .then(() => {
        $('#copy').text('Copied!');
        setTimeout(() => {
            $('#copy').text('Copy');
        }, 2000);
    })
    .catch(err => {
      console.error("Failed to copy: ", err);
    });
}
