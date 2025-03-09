/**
 * DO NOT EDIT THIS FILE! This script is for the WordPress admin area only.
 *
 * Information on customising Auction Nudge can be found here:
 * https://www.auctionnudge.com/customize/behaviour
 *
 */
function setup_parameter_groups() {
	jQuery(
		".an-parameter-group:not(.an-parameter-group-feed) .an-parameter-group-content",
	).hide();
	jQuery(".an-parameter-group legend").each(function () {
		var legend_text = jQuery(this).text();
		if (legend_text.indexOf("[+]") == -1) {
			jQuery(this).text(legend_text + " [+]");
		}
	});
	jQuery(".an-parameter-group legend").click(function () {
		if (
			!jQuery(
				".an-parameter-group-content",
				jQuery(this).parent(".an-parameter-group"),
			).is(":visible")
		) {
			//Hide all
			jQuery(
				".an-parameter-group-content",
				jQuery(this).parents(".an-custom-field-tab"),
			).slideUp();
			//Show this
			jQuery(
				".an-parameter-group-content",
				jQuery(this).parent(".an-parameter-group"),
			).slideDown();
		}
	});
}

function an_show_theme_options(theme, context) {
	//Carousel options
	jQuery("#carousel_scroll-container", context).hide();
	jQuery("#carousel_width-container", context).hide();
	jQuery("#carousel_auto-container", context).hide();
	//Grid options
	jQuery("#grid_width-container", context).hide();
	jQuery("#grid_cols-container", context).hide();
	//Common options
	jQuery("#search_box-container", context).hide();
	jQuery("#cats_output-container", context).hide();
	jQuery("#page-container", context).hide();
	jQuery("#img_size-container", context).hide();
	jQuery("#show_logo-container", context).hide();
	switch (theme) {
		case "carousel":
			jQuery("#carousel_scroll-container", context).show();
			jQuery("#carousel_width-container", context).show();
			jQuery("#carousel_auto-container", context).show();

			break;
		case "grid":
			jQuery("#page-container", context).show();
			jQuery("#grid_width-container", context).show();
			jQuery("#grid_cols-container", context).show();
			jQuery("#cats_output-container", context).show();
			jQuery("#img_size-container", context).show();
			jQuery("#show_logo-container", context).show();

			break;
		default:
			jQuery("#page-container", context).show();
			jQuery("#cats_output-container", context).show();
			jQuery("#img_size-container", context).show();
			jQuery("#show_logo-container", context).show();
			jQuery("#search_box-container", context).show();

			break;
	}
}

function an_alt_inputs() {
	var i = 0;
	jQuery(".control-group").each(function () {
		if (jQuery(this).is(":visible")) {
			if (i % 2 == 0) {
				jQuery(this).addClass("alt");
			}
			i++;
		}
	});
}

function an_create_item_data(shortcode_data = []) {
	var item_data = [];

	for (data_key in shortcode_data) {
		if (data_key.indexOf("item_") !== -1) {
			item_data[data_key.replace("item_", "")] = shortcode_data[data_key];
		}
	}

	return item_data;
}

//Tooltips
function an_setup_tooltips() {
	jQuery("a.an-tooltip").on({
		mouseenter: function (e) {
			var title = jQuery(this).data("title");
			jQuery('<p id="an-tooltip-active"></p>')
				.text(title)
				.appendTo("body")
				.fadeIn("slow");
		},
		mouseleave: function (e) {
			jQuery("#an-tooltip-active").remove();
		},
		mousemove: function (e) {
			if (an_is_touch_device()) {
				var mousex = e.pageX - 150;
			} else {
				var mousex = e.pageX - 120;
			}

			var mousey = e.pageY + 5;
			jQuery("#an-tooltip-active").css({ top: mousey, left: mousex });
		},
	});
}

function an_build_item_shortcode(item_data = []) {
	var out = '[auction-nudge tool="listings"';
	for (attr_key in item_data) {
		out += " " + attr_key.toLowerCase() + '="' + item_data[attr_key] + '"';
	}
	out += "]";

	return out;
}

function an_update_item_snippets(item_data = []) {
	var shortcode = an_build_item_shortcode(item_data);

	var shortcode_container = jQuery("#an-shortcode-item");

	shortcode_container.html(shortcode);
}

function an_shortcode_input_value(data_key, input) {
	var value = input.val();

	// Sanitize
	value = value.replace(/[^a-zA-Z0-9_\-\.\$\!\*\%]/g, "");

	return value;
}

function an_setup_settings_ui() {
	//Options page only
	var body = jQuery("body.settings_page_an_options_page");

	if (!body.length) {
		return;
	}

	//Shortcode form
	var container = jQuery("#an-shortcode-form-container", body);
	if (container.length) {
		var default_data = [];
		var shortcode_data = [];

		//Update Shortcode
		var update_shortcode = function (input) {
			//Determine key
			var data_key = input.attr("name");
			if (data_key == "cats_output" || data_key == "search_box") {
				data_key = "item_" + data_key;
			}

			default_data[data_key] = input.data("default").toString();

			var input_value = an_shortcode_input_value(data_key, input);

			//Compare
			if (input_value != default_data[data_key]) {
				//Update
				shortcode_data[data_key] = input_value;
				//Is default
			} else {
				//Remove
				delete shortcode_data[data_key];
			}

			//Update snippet
			var item_data = an_create_item_data(shortcode_data);
			an_update_item_snippets(item_data);
		};

		//Username check
		var username_check = function () {
			var check_input = function (input) {
				if (!input.val().trim()) {
					input.addClass("an-error");

					return false;
				} else {
					input.removeClass("an-error");

					return true;
				}
			};

			var check_form = function (form) {
				var input = jQuery('input[name="item_SellerID"]', form);

				var success = check_input(input);
				var button = jQuery('input[type="submit"]', form);

				if (!success) {
					button.attr("disabled", "disabled");
				} else {
					button.removeAttr("disabled");
				}

				return success;
			};

			var form = jQuery("#an-shortcode-form");

			//Initial
			check_form(form);

			//Form submit
			form.on("submit", function () {
				check_form(form);
			});

			//Input change
			var inputs = jQuery('input[name="item_SellerID"]', container);
			inputs.on("change keyup input", function () {
				check_form(form);
			});
		};

		//Get inputs
		var inputs = jQuery(".controls input, .controls select", container);

		//Each
		inputs.each(function () {
			var input = jQuery(this);

			//On change
			input.on("change", function () {
				update_shortcode(jQuery(this));
			});

			//Initial
			update_shortcode(input);
		});

		username_check();
	}
}

jQuery(document).ready(function () {
	setup_parameter_groups();
	an_setup_tooltips();
	an_setup_settings_ui();

	var custom_field_parent = jQuery("#listings-tab");
	an_show_theme_options(jQuery("#theme").val(), custom_field_parent);
	jQuery("#theme").change(function () {
		an_show_theme_options(jQuery(this).val(), custom_field_parent);
	});

	jQuery("select#an-tab-links").on("change", function (e) {
		e.preventDefault();

		var tab_show = jQuery("option:selected", this).data("tab");

		//Hide all
		jQuery(".an-custom-field-tab").hide();
		//Show this
		jQuery(".an-custom-field-tab#" + tab_show).show();

		return false;
	});

	//Adblock warning
	jQuery("#auction-nudge-items .an-notice").hide();
	window.setTimeout(function () {
		jQuery("#auction-nudge-items .an-notice").show();
	}, 1000);
});

//Touch device?
//Thanks https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript/4819886#4819886
function an_is_touch_device() {
	var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
	var mq = function (media_qry) {
		return window.matchMedia(media_qry).matches;
	};

	if (
		"ontouchstart" in window ||
		(window.DocumentTouch && document instanceof DocumentTouch)
	) {
		return true;
	}

	// include the 'heartz' as a way to have a non matching MQ to help terminate the join
	// https://git.io/vznFH
	var media_qry = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join(
		"",
	);
	return mq(media_qry);
}
