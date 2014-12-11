var TemplateHelper = {

  Init : function() {
    var objectInstance = this;

    this.EventManager.registerEvent('displayMovement');

    this.Component.Init(objectInstance);

    jQuery(window).bind('resize scroll', function(){
      objectInstance.EventManager.triggerEvent('displayMovement');
    });

    this.StoryFrontEndController.Init();
  },

  StoryFrontEndController : {

    isMobile : {
      Android: function() {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
        return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
      }
    },

  Init : function() {
    var objectInstance = this,
        runStoryBox    = this.isMobile.any;

    if(runStoryBox == false)
      return false;

    StoryBox.Init(jQuery('body'), {});

    jQuery('[data-story-tale]').each(function(){
      var objectInstance = jQuery.extend(1, {}, StoryTale),
          effects        = jQuery(this).attr('data-story-tale');

      objectInstance.Init(jQuery(this), effects.split(','));
    });
  }

}

};

TemplateHelper.EventManager = {

  eventList : {},

  init : function() {

  },

  registerEvent : function(event_identifier) {
    if(typeof this.eventList[event_identifier] == "undefined")
      this.eventList[event_identifier] = [];
  },

  unRegisterEvent : function(event_identifier) {
    if(typeof this.eventList[event_identifier] != "undefined")
      delete this.eventList[event_identifier];
  },

  triggerEvent  : function(event_identifier, data) {
    data = typeof data != "undefined" ? data : {};

    if(typeof this.eventList[event_identifier] != "undefined") {
      var currentEventInformation = this.eventList[event_identifier];

      for(var currentListenerIndex in currentEventInformation) {
        var currentListener       = currentEventInformation[currentListenerIndex],
            currentListenerMethod = currentListener['method'];

        currentListener.object[currentListenerMethod].call(currentListener.object, data);
      }
    }

  },

  listenEvent : function(event_identifier, object, method) {
    if(typeof this.eventList[event_identifier] == "undefined")
      this.registerEvent(event_identifier);

    this.eventList[event_identifier][this.eventList[event_identifier].length] = {
      'object' : object,
      'method' : method
    };
  }
};

TemplateHelper.Component = {

  activeComponents : {

  },

  templateHelperInstance : {},

  Init : function(templateHelperInstance) {
    this.templateHelperInstance = templateHelperInstance;

    var objectInstance = this;

    jQuery.each(this.templateHelperInstance.Components, function(name, component){

      jQuery(component.containerIdentifier).each(function(){

        objectInstance.Factory(jQuery(this), name);

      });

    });
  },

  Factory : function(componentContainerObject, componentName) {
    if(typeof this.activeComponents[componentName] == "undefined")
      this.activeComponents[componentName] = [];

    var componentInstance = jQuery.extend(1, this.templateHelperInstance.Components[componentName], {});

    componentInstance.Init(componentContainerObject, this.templateHelperInstance);

    this.activeComponents[componentName][this.activeComponents[componentName].length] = componentInstance;
  }

};

TemplateHelper.Components = {

  Menu : {

    templateHelperInstance : {},
    alias                  : "component_menu",
    containerObject        : {},
    containerIdentifier    : ".component-navigation",

    Init : function(componentContainerObject, templateHelperInstance) {
      var objectInstance = this;

      this.containerObject        = componentContainerObject;
      this.templateHelperInstance = templateHelperInstance;
      this.containerObject.data(this.alias, this);
      this.containerObject.attr('data-initial-height', this.containerObject.height());

      this.containerObject.find('li a').click(function(){
        var scrollTo = jQuery(jQuery(this).attr('href')).offset().top;

        if(objectInstance.containerObject.height() < scrollTo)
          scrollTo -= objectInstance.containerObject.height() + 10;

        jQuery('html, body').animate({
          scrollTop: scrollTo
        }, 1000);
      });

      this.handleDisplay();

      this.templateHelperInstance.EventManager.listenEvent('displayMovement', this, 'handleDisplay');
    },

    handleDisplay : function() {
      var topPosition     = this.containerObject.offset().top,
          containerHeight = this.containerObject.height();

      if(this.containerObject.hasClass('fixed')) {
        topPosition = parseInt(this.containerObject.attr('data-initial-top-position'));

        if(topPosition < 0) {

          this.containerObject.removeClass('fixed');
          topPosition = this.containerObject.offset().top;
          this.containerObject.attr('data-initial-top-position', topPosition);
          this.containerObject.addClass('fixed');
        }
      }

      if(jQuery(document).scrollTop() > topPosition + containerHeight) {
        if(this.containerObject.hasClass('fixed'))
          return;

        this.containerObject.attr('data-initial-top-position', topPosition);
        this.containerObject.addClass('fixed');

        if(this.containerObject.prev().hasClass('component-primary-line-separator')) {
          this.containerObject.prev().addClass('fixed');
          this.containerObject.addClass('with-top-separator');
        }

        jQuery('body').css('padding-top', (parseFloat(jQuery('body').css('padding-top')) + containerHeight));
      } else {
        if(this.containerObject.prev().hasClass('component-primary-line-separator')) {
          this.containerObject.prev().removeClass('fixed');
          this.containerObject.removeClass('with-top-separator');
        }

        this.containerObject.removeClass('fixed');
        jQuery('body').css('padding-top', 0);
      }
    }

  },

  SeparatorAchievements : {

    templateHelperInstance                 : {},
    alias                                  : "component_separator_achievements",
    containerObject                        : {},
    containerIdentifier                    : ".component-separator-achievements",
    containerServedClass                   : "served",
    displayedNumberIdentifier              : "p.number > span",

    Init : function(componentContainerObject, templateHelperInstance) {
      this.containerObject        = componentContainerObject;
      this.templateHelperInstance = templateHelperInstance;
      this.containerObject.data(this.alias, this);

      this.handleDisplay();

      this.templateHelperInstance.EventManager.listenEvent('displayMovement', this, 'handleDisplay');
    },

    handleDisplay : function() {
      if(this.containerObject.hasClass(this.containerServedClass))
        return;

      var currentScrollTop = jQuery(window).scrollTop() + window.innerHeight;

      if(currentScrollTop >= this.containerObject.offset().top
          && currentScrollTop <= ( this.containerObject.offset().top + window.innerHeight)) {
        var objectInstance = this;

        this.containerObject.addClass(this.containerServedClass);

        this.containerObject.find(this.displayedNumberIdentifier).each(function() {
          var currentContainer = jQuery(this),
              from             = parseInt(jQuery(this).text(), 10);

          jQuery({until: 0}).animate({until: from}, {
            duration: 1000,
            step: function() {
              currentContainer.text(Math.ceil(this.until));
            }
          });
        });
      }
    }

  },

  SeparatorProgress : {

    templateHelperInstance                 : {},
    alias                                  : "component_separator_progress",
    containerObject                        : {},
    containerIdentifier                    : ".component-separator-progress",

    Init : function(componentContainerObject, templateHelperInstance) {
      this.containerObject        = componentContainerObject;
      this.templateHelperInstance = templateHelperInstance;
      this.containerObject.data(this.alias, this);

      this.containerObject.find('.progress-bar-round[data-progress]').each(function(){
        jQuery(this).append('<input type="text" data-skin="tron" value="' + jQuery(this).attr('data-progress') + '"/>');
        jQuery(this).find('input[value="' + jQuery(this).attr('data-progress') + '"]').knob({
          readOnly  : true,
          fgColor   : "#FFFFFF",
          bgColor   : "#656B6F",
          lineCap   : "rounded",
          thickness : 0.2,
          width     : 100,
          height    : 100
        });
      });
    }

  },

  ProgressBar : {
    templateHelperInstance                 : {},
    alias                                  : "component_progress_bar_fill_in",
    containerObject                        : {},
    containerIdentifier                    : ".progress-bar",
    containerServedClass                   : "served",
    from                                   : 0,

    Init : function(componentContainerObject, templateHelperInstance) {
      this.containerObject        = componentContainerObject;
      this.templateHelperInstance = templateHelperInstance;
      this.containerObject.data(this.alias, this);

      this.from = parseInt(this.containerObject.attr("aria-valuenow"), 10);
      this.containerObject.attr("aria-valuenow", 0);
      this.containerObject.css('width', 0);

      this.handleDisplay();

      this.templateHelperInstance.EventManager.listenEvent('displayMovement', this, 'handleDisplay');
    },

    handleDisplay : function() {
      if(this.containerObject.hasClass(this.containerServedClass))
        return;


      var currentScrollTop = jQuery(window).scrollTop() + window.innerHeight;

      if(currentScrollTop >= this.containerObject.offset().top
          && currentScrollTop <= ( this.containerObject.offset().top + window.innerHeight)) {
        this.containerObject.addClass(this.containerServedClass);

        var currentContainer = this.containerObject,
            from             = this.from;

        jQuery({until: 0}).animate({until: from}, {
          duration: 1000,
          step: function() {
            currentContainer.attr("aria-valuenow", Math.ceil(this.until));
            currentContainer.css('width', Math.ceil(this.until) + '%');
          }
        });
      }
    }
  },

  SeparatorTestimonial : {

    templateHelperInstance      : {},
    alias                       : "component_separator_testimonial",
    containerObject             : {},
    containerIdentifier         : ".component-separator-testimonial",
    testimonialListObject       : {},
    testimonialListIdentifier   : " ul > li",
    testimonialDisplayEffect    : "slideInLeft",
    testimonialHideEffect       : "slideOutRight",

    Init : function(componentContainerObject, templateHelperInstance) {
      this.containerObject        = componentContainerObject;
      this.templateHelperInstance = templateHelperInstance;
      this.containerObject.data(this.alias, this);

      this.testimonialListObject = this.containerObject.find(this.testimonialListIdentifier);
      this.testimonialListObject.not(":first").hide();
      this.testimonialListObject.eq(0).addClass("current");

      var objectInstance = this;

      setInterval(function(){
        objectInstance.displayNextTestimonial();
      }, 6000);
    },

    displayNextTestimonial : function() {
      var objectInstance     = this,
          totalTestimonials  = this.testimonialListObject.length,
          currentTestimonial = this.testimonialListObject.filter(".current").index(),
          nextTestimonial    = currentTestimonial + 1;

      if(nextTestimonial + 1 > totalTestimonials)
        nextTestimonial = 0;

      this.testimonialListObject.eq(currentTestimonial)
          .removeClass('current animated ' + this.testimonialDisplayEffect)
          .addClass('animated ' + this.testimonialHideEffect);

      setTimeout(function(){
        objectInstance.testimonialListObject.eq(currentTestimonial).hide();

        objectInstance.testimonialListObject.eq(nextTestimonial)
            .removeClass('animated ' + objectInstance.testimonialHideEffect)
            .show()
            .addClass('animated current ' + objectInstance.testimonialDisplayEffect);
      }, 500);


    }

  }

};

jQuery(document).ready(function(){
  TemplateHelper.Init();
});