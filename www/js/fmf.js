document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
	alert(device.uuid);
}

//Create cool looking card after new entry

$("#save-recipient").click(function() {
	var recName = document.getElementById("recipient-name").value;
	
	//Go to dialog if name is empty
	
	if (recName == "") {
		window.location="html/dialogs/wizard-field-error.html";
		return false;
	}
	
	//Fill in rec name
	
	$("#recipient-card-name").html(recName);
	
	//Take away previous listings
	
	$("#recipient-select").fadeOut("fast");
	
	//Animate rec card
	
	$("#recipient-enter").animate({
		"margin-top": "125px"
	}, 500, "swing", function() {
		$("#recipient-enter").css("margin-top", "20px");
		$("#recipient-info").fadeIn("slow", function() {
			$("#recipient-enter").fadeOut("fast", function() {
				$("#wizard-options").fadeIn();
			});
		});
	});
});

//Create cool card after list click

$(".recipient-list li").click(function() {
	var recName = $(this).children().children().children().html();
	$("#recipient-card-name").html(recName);
	$("#recipient-select").fadeOut(function() {
		$("#recipient-enter").fadeOut(function() {
			$("#recipient-info").fadeIn(function() {
				$("#wizard-options").fadeIn();
			});
		});
	});
});

//Start over button

$("#start-over").click(function() {
	location.reload();
});

//Add image borders for styled choices

$(".wizard-flower-block img").click(function() {
	$(".wizard-flower-block").attr("style", "");
	$(this).parents(".wizard-flower-block").css("border", "#09C 3px solid");
});

//Change pointer height on show with a little animation

$("#personalized").on("pageshow", function() {
	var imageHeight = $(".personalized-image").height();
	
	//Ajax loader graphic
	
	$("#loader-graphic").css("margin-top", (imageHeight/2) - 50);
	
	//Image pointers and image information
	
	$(".personalized-pointer").animate({
		"padding-top": (imageHeight/2) - 24
	}, 500, function() {
		setTimeout(function() {
			$("#personalized-image-name").fadeIn("slow");
			$("#personalized-image-price").fadeIn("slow");
		}, 1000);
	});
});

//Thumb ratings

$("#rating-up").click(function() {
	$(this).css("color", "#edbe01");
	$("#rating-down").attr("style", "");
});

$("#rating-down").click(function() {
	$(this).css("color", "#900");
	$("#rating-up").attr("style", "");
});

//Show AJAX loader for fun

$("#personalized-forward").click(function() {
	$(".ajax-block").fadeIn();
	setTimeout(function() {
		$(".ajax-block").fadeOut();
	}, 2000);
});