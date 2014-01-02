localStorage.path_to_actions = "http://localhost/sites/five_minute/actions.php";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() { //Function to work when device is up
	//Check for kill code
	
	$.get("http://emboldenmedia.com/apps/fmf/kill_check.php", function(data){
		if (data == "kill") {
			window.location = "html/dialogs/kill-error.html";
		}
	});

	$.post("http://emboldenmedia.com/apps/fmf/", { deviceID: device.uuid }, function(data) {
		//Here we handle a response
	});
}

//Alter position of clock logo

$(".clock-logo").css("left", ($(window).width() / 2) - 85);

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

function setRec(recName) {
	$("#recipient-card-name").html(recName);
	$("#recipient-select").fadeOut(function() {
		$("#recipient-enter").fadeOut(function() {
			$("#recipient-info").fadeIn(function() {
				$("#wizard-options").fadeIn();
			});
		});
	});
}

//Start over button

$("#start-over").click(function() {
	location.reload();
});

//Show best sellers dialog

$("#best-sellers-link").click(function() {
	window.location = "html/dialogs/coming-soon.html";
});

//Add image borders for styled choices

$(".wizard-flower-block img").click(function() {
	$(".wizard-flower-block").attr("style", "");
	$(this).parents(".wizard-flower-block").css("border", "#09C 3px solid");
	$("#personal-flower-type").val($(this).attr("data-flower-type"));
});

//Change pointer height on show with a little animation

function renderPersonal() {
	setTimeout(function() {
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
	}, 500);
}

//Thumb ratings

$("#rating-up").click(function() {
	$(this).css("color", "#edbe01");
	$("#rating-down").attr("style", "");
});

$("#rating-down").click(function() {
	$(this).css("color", "#900");
	$("#rating-up").attr("style", "");
});

//Scroll to occasions

$("#for-occasion").click(function() {
	$("body").animate({
		scrollTop: $("#occasion-list").offset().top
	}, 800);
});

//Validate billing information

function submitBilling() {
	if (
		$("#billing-first-name").val() == "" ||
		$("#billing-last-name").val() == "" ||
		$("#billing-address-1").val() == "" ||
		$("#billing-city").val() == "" ||
		$("#billing-state").val() == "" ||
		$("#billing-zipcode").val() == ""
	) {
		alert("Please enter all information");
		return false;
	} else {
		//AJAX here and next part on callback
		
		$.mobile.changePage("#delivery", { transition: "fade" });
	};
}

//Validate delivery information

function submitDelivery() {
	if (
		$("#delivery-first-name").val() == "" ||
		$("#delivery-last-name").val() == "" ||
		$("#delivery-address-1").val() == "" ||
		$("#delivery-city").val() == "" ||
		$("#delivery-state").val() == "" ||
		$("#delivery-zipcode").val() == ""
	) {
		alert("Please enter all information");
		return false;
	} else {
		$.mobile.changePage("#message", { transition: "fade" });
	};
}

//Validate and submit entire order

function submitOrder() {
	if (
		$("#payment-card-num").val() == "" ||
		$("#payment-expire-month").val() == "" ||
		$("#payment-expire-year").val() == "" ||
		$("#payment-security-code").val() == ""
	) {
		alert("Please enter all information");
		return false;
	} else {
		showLoader();
		
		//Get Stripe token
		
		Stripe.card.createToken({
			number: $('#payment-card-num').val(),
			cvc: $('#payment-security-code').val(),
			exp_month: $('#payment-expire-month').val(),
			exp_year: $('#payment-expire-year').val()
		}, function(status, response) {
			if (response.error) {
				alert(response.error.message);
				return false;
			} else {
				//Send the beast to the pits of the backend!
				
				$.post(localStorage.path_to_actions, {
					userUuid: 1, //CHANGE THIS!!
					arrangementSelected: localStorage.arrangementSelected,
					arrangementPrice: localStorage.arrangementPrice,
					paymentToken: response['id'],
					saveBilling: $("#save-billing-address-button").prop("checked"),
					saveDelivery: $("#save-delivery-address-button").prop("checked"),
					billingFirstName: $("#billing-first-name").val(),
					billingLastName: $("#billing-last-name").val(),
					billingAddress1: $("#billing-address-1").val(),
					billingAddress2: $("#billing-address-2").val(),
					billingCity: $("#billing-city").val(),
					billingState: $("#billing-state").val(),
					billingZipcode: $("#billing-zipcode").val(),
					deliveryFirstName: $("#delivery-first-name").val(),
					deliveryLastName: $("#delivery-last-name").val(),
					deliveryAddress1: $("#delivery-address-1").val(),
					deliveryAddress2: $("#delivery-address-2").val(),
					deliveryCity: $("#delivery-city").val(),
					deliveryState: $("#delivery-state").val(),
					deliveryZipcode: $("#delivery-zipcode").val(),
					personalMessage: $("#personal-message").val()
				}, function() {
					hideLoader();
					$("#success-image").attr("src", "img/flowers/" + localStorage.arrangementSelected + "_low.jpg");
					$.mobile.changePage("#success", { transition: "fade" });
				});
			}
		});
	}
}

//Select arrangement handler

function selectArrange(arrangement, price) {
	localStorage.arrangementSelected = arrangement;
	localStorage.arrangementPrice = price;
	$.mobile.changePage("#billing", { transition: "fade" });
}

//Select personalized arrangement handler

function selectPersonal(arrangement, price) {
	localStorage.arrangementSelected = arrangement;
	localStorage.arrangementPrice = price;
	$.mobile.changePage("#billing", { transition: "fade" });
}

//Complete order and redirect to index while reloading DOM

function completeOrder() {
	$.mobile.changePage("#index", { transition: "fade" });
	location.reload();
}
