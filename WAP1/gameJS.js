$(document).ready(function() {
    var current_progress = 100;
    var health = 100;

    var interval = setInterval(function () {
        current_progress -= 10;
        var currentHealth = health - current_progress
        if (current_progress <= 0)
            clearInterval(interval);
        $('#test')
            .css("width", currentHealth + '%')
            .attr("aria-valuenow", currentHealth);
        $('#hp')
            .text(currentHealth + " HP");
     }, 1000);
});