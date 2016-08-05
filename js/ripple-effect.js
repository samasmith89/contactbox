
$(document).ready(function(){
  $('.ripple-btn img').on('dragstart', function(event) { event.preventDefault(); });
  $(document).on('click', '.ripple-btn', function(e) {
  	rippleEffect($(this), e);
  });
  $(document).on('click tap', function(e){
  	var clickSearch = $(e.target).hasClass('core-search-menu') || $(e.target).closest('.core-search-menu').hasClass('core-search-menu')
  	|| $(e.target).hasClass('core-top-bar-search-bar') || $(e.target).closest('.core-top-bar-search-bar').hasClass('core-top-bar-search-bar')
  	|| $(e.target).hasClass('core-top-bar-search-btn') || $(e.target).closest('.core-top-bar-search-btn').hasClass('core-top-bar-search-btn')
  	|| $(e.target).hasClass('core-top-bar-search-bar-input') ;
  });
});



/* --- ripple effect --- */
function rippleEffect(button, e){
	if(button.is("a") && !button.hasClass('external-link')){
		e.preventDefault();
		var href = button.attr("href");
		unloadModules();
	}
	var rippleElement = $('<span class="ripple-effect" />'),
	buttonElement = button,
	btnOffset = buttonElement.offset(),
	xPos = e.pageX - btnOffset.left,
	yPos = e.pageY - btnOffset.top,
	size = parseInt(Math.min(buttonElement.outerHeight(), buttonElement.outerWidth()) * 0.5),
	animateSize = parseInt(Math.max(buttonElement.outerWidth(), buttonElement.outerHeight()) * Math.PI);

	rippleElement.css({ top: yPos, left: xPos, width: size, height: size, backgroundColor: buttonElement.data("ripple-color")})
	.appendTo(buttonElement).animate({ width: animateSize, height: animateSize, opacity: 0 }, 700, function() {
		$(this).remove();
		if(typeof href != 'undefined'){
			window.location = href;
		}
	});
}
