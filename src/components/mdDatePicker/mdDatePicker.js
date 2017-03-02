/* global = */

function DatePickerCtrl($scope, $mdDialog, $mdMedia, $timeout, currentDate, minDate, maxDate, useUtc, utcOffset) {
	$scope.$mdMedia = $mdMedia;
	
	var self = this;

    this.selectingYear = false;

    this.init = function() {
    	// normalize moments
    	this.currentMoment = this.normalizeMoment(currentDate);
    	this.minMoment = this.normalizeMoment(minDate, true);
    	this.maxMoment = this.normalizeMoment(maxDate, true);
    	
    	// validate min and max date
    	if (this.minMoment && this.maxMoment) {
    		if (this.maxMoment.isBefore(this.minMoment, "days")) {
    			this.maxMoment = moment(this.minMoment).add(1, 'days');
    		}
    	}
    	
    	if (this.currentMoment) {
    		// check min date
	    	if (this.minMoment && this.currentMoment.isBefore(this.minMoment, "days")) {
    			this.currentMoment = moment(this.minMoment);
	    	}
	    	
	    	// check max date
	    	if (this.maxMoment && this.currentMoment.isAfter(this.maxMoment, "days")) {
    			this.currentMoment = moment(this.maxMoment);
	    	}
    	}
    	
    	$scope.year = this.currentMoment.year();
    	
    	var startYear = this.minMoment ? this.minMoment.year() : 1900;
    	var endYear = this.maxMoment ? this.maxMoment.year() : null;
    	
    	this.yearItems = {
	        currentIndex_: 0,
	        PAGE_SIZE: 5,
	        START: startYear,
	        getItemAtIndex: function(index) {
	        	if(this.currentIndex_ < index)
	                this.currentIndex_ = index;
	        	
	        	return this.START + index;
	        },
	        getLength: function() {
	            return this.currentIndex_ + Math.floor(this.PAGE_SIZE / 2);
	        }
	    };
    };
    
    this.normalizeMoment = function(m, skipNull) {
    	if (!m) {
    		if (skipNull) {
    			return undefined;
    		}
    		
    		m = useUtc || utcOffset ? moment().utc(true) : moment();
    	}
    	
    	m = moment.isMoment(m) ? m : moment(m); 
    	
    	if (useUtc) {
    		m = moment.utc([m.year(), m.month(), m.date()]);
    	
    	} else if (utcOffset) {
    		m = moment.utc([m.year(), m.month(), m.date()]).utcOffset(utcOffset, true);
    	}
    	
    	return m;
    };
    
	this.selectYear = function(year) {
        self.currentMoment.year(year);
        $scope.year = year;
        self.selectingYear = false;
        self.animate();
    };
    
    this.showYear = function() { 
        self.yearTopIndex = (self.currentMoment.year() - self.yearItems.START) + Math.floor(self.yearItems.PAGE_SIZE / 2);
        self.yearItems.currentIndex_ = (self.currentMoment.year() - self.yearItems.START) + 1;
        self.selectingYear = true;
    };
    
    this.showCalendar = function() {
        self.selectingYear = false;
    };
    
    this.today = function() {
    	self.currentMoment = this.normalizeMoment();
    	this.selectYear(self.currentMoment.year());
    };
    
    this.isTodayAvailable = function() {
    	var minValid = true, maxValid = true;
    	var today = this.normalizeMoment(moment());
    	
    	if (this.minMoment) {
    		minValid = today.isSameOrAfter(this.minMoment, "days");
    	}
    	
    	if (this.maxMoment) {
    		maxValid = today.isSameOrBefore(this.maxMoment, "days");
    	}
    	
    	return minValid && maxValid;
    };

    this.cancel = function() {
        $mdDialog.cancel();
    };

    this.confirm = function() {
    	var date = this.currentMoment;
    	
    	if (this.minMoment && this.currentMoment.isBefore(this.minMoment, "days")) {
    		date = moment(this.minMoment);
    	}
    	
    	if (this.maxMoment && this.currentMoment.isAfter(this.maxMoment, "days")) {
    		date = moment(this.maxMoment);
    	}  	
    	
        $mdDialog.hide(date.toDate());
    };
    
    this.animate = function() {
        self.animating = true;
        $timeout(angular.noop).then(function() {
            self.animating = false;
        })  
    };
    
    // init
    this.init();
}

module.provider("$mdpDatePicker", function() {
    var LABEL_OK = "OK",
        LABEL_CANCEL = "Cancel",
        LABEL_TODAY = "Today"; 
        
    this.setOKButtonLabel = function(label) {
        LABEL_OK = label;
    };
    
    this.setCancelButtonLabel = function(label) {
        LABEL_CANCEL = label;
    };
    
    this.$get = ["$mdDialog", function($mdDialog) {
        var datePicker = function(currentDate, options) {
            if (!angular.isDate(currentDate)) currentDate = null;
            if (!angular.isObject(options)) options = {};
            if (!angular.isDate(options.minDate)) options.minDate = null;
            if (!angular.isDate(options.maxDate)) options.maxDate = null;
            if (!options.useUtc || "undefined" === typeof options.useUtc) options.useUtc = false;
    
            return $mdDialog.show({
                controller:  ['$scope', '$mdDialog', '$mdMedia', '$timeout', 'currentDate', 'minDate', 'maxDate', 'useUtc', 'utcOffset', DatePickerCtrl],
                controllerAs: 'datepicker',
                clickOutsideToClose: true,
                skipHide: true,
                template: '<md-dialog aria-label="" class="mdp-datepicker" ng-class="{ \'portrait\': !$mdMedia(\'gt-xs\') }">' +
                            '<md-dialog-content layout="row" layout-wrap>' +
                                '<div layout="column" layout-align="start center">' +
                                    '<md-toolbar layout-align="start start" flex class="mdp-datepicker-date-wrapper md-hue-1 md-primary" layout="column">' +
                                        '<span class="mdp-datepicker-year" ng-click="datepicker.showYear()" ng-class="{ \'active\': datepicker.selectingYear }">{{ datepicker.currentMoment.format(\'YYYY\') }}</span>' +
                                        '<span class="mdp-datepicker-date" ng-click="datepicker.showCalendar()" ng-class="{ \'active\': !datepicker.selectingYear }">{{ datepicker.currentMoment.format("ddd, MMM DD") }}</span> ' +
                                    '</md-toolbar>' + 
                                '</div>' +  
                                '<div>' + 
                                    '<div class="mdp-datepicker-select-year mdp-animation-zoom" layout="column" ng-if="datepicker.selectingYear">' +
                                        '<md-virtual-repeat-container md-auto-shrink md-top-index="datepicker.yearTopIndex">' +
                                            '<div flex md-virtual-repeat="item in datepicker.yearItems" md-on-demand class="repeated-year">' +
                                                '<span class="md-button" ng-click="datepicker.selectYear(item)" md-ink-ripple ng-class="{ \'md-primary current\': item == year }">{{ item }}</span>' +
                                            '</div>' +
                                        '</md-virtual-repeat-container>' +
                                    '</div>' +
                                    '<mdp-calendar ng-if="!datepicker.selectingYear" class="mdp-animation-zoom" date="datepicker.currentMoment" min-date="datepicker.minMoment" max-date="datepicker.maxMoment"></mdp-calendar>' +
                                    '<md-dialog-actions layout="row">' +
                                    	'<md-button ng-click="datepicker.today()" ng-if="datepicker.isTodayAvailable()" aria-label="' + LABEL_TODAY + '">' + LABEL_TODAY + '</md-button>' +
                                    	'<span flex></span>' +
                                        '<md-button ng-click="datepicker.cancel()" aria-label="' + LABEL_CANCEL + '">' + LABEL_CANCEL + '</md-button>' +
                                        '<md-button ng-click="datepicker.confirm()" class="md-primary" aria-label="' + LABEL_OK + '">' + LABEL_OK + '</md-button>' +
                                    '</md-dialog-actions>' +
                                '</div>' +
                            '</md-dialog-content>' +
                        '</md-dialog>',
                targetEvent: options.targetEvent,
                locals: {
                    currentDate: currentDate,
                    minDate: options.minDate, 
                    maxDate: options.maxDate,
                    useUtc: options.useUtc, 
                    utcOffset: options.utcOffset
                },
                fullscreen: options.fullscreen,
            });
        };
    
        return datePicker;
    }];
});

function CalendarCtrl($scope) {
	var _self = this;
	
    this.weekDays = moment.weekdaysMin();
    this.daysInMonth = [];
    
    this.updateDaysInMonth = function() {
        var days = $scope.date.daysInMonth(),
        	firstDay = moment($scope.date).date(1).day();
        
        var viewDays = Math.ceil((days + firstDay) / 7) * 7;

        var arr = [];
        for(var i = 1; i <= viewDays; i++) {
        	var n = (i - firstDay);
        	arr.push(i > firstDay && i <= days + firstDay ? {n: n, valid: this.isValidDay(n)} : false);
        }
        
        this.daysInMonth = arr;
    };
    
    this.isValidDay = function(day) {
    	var minValid = true, maxValid = true;
    	var date = moment($scope.date).date(day);
    	
    	if ($scope.minDate) {
    		minValid = date.isSameOrAfter($scope.minDate);
    	}
    	
    	if ($scope.maxDate) {
    		maxValid = date.isSameOrBefore($scope.maxDate);
    	}
    	
    	return minValid && maxValid;
    };
   
    this.selectDate = function(dom) {
    	$scope.date.date(dom);
    };

    this.nextMonth = function() {
    	$scope.date.add(1, 'months');
    	this.updateDaysInMonth();
    };

    this.prevMonth = function() {
    	$scope.date.subtract(1, 'months');
    	this.updateDaysInMonth();
    };
    
    // init
    this.$onInit = function() {
    	this.updateDaysInMonth();
    }
}

module.directive("mdpCalendar", ["$animate", function($animate) {
    return {
        restrict: 'E',
        scope: {
            "date": "=",
            "minDate": "=",
            "maxDate": "="
        },
        template: '<div class="mdp-calendar">' +
                    '<div layout="row" layout-align="space-between center">' +
                        '<md-button aria-label="previous month" class="md-icon-button" ng-click="calendar.prevMonth()"><md-icon md-font-set="material-icons"> chevron_left </md-icon></md-button>' +
                        '<md-button class="mdp-calendar-monthyear" ng-show="!calendar.animating" ng-click="showYear()">{{ date.format("MMMM YYYY") }}</md-button>' +
                        '<md-button aria-label="next month" class="md-icon-button" ng-click="calendar.nextMonth()"><md-icon md-font-set="material-icons"> chevron_right </md-icon></md-button>' +
                    '</div>' +
                    '<div layout="row" layout-align="space-around center" class="mdp-calendar-week-days" ng-show="!calendar.animating">' +
                        '<div layout layout-align="center center" ng-repeat="d in calendar.weekDays track by $index">{{ d }}</div>' +
                    '</div>' +
                    '<div layout="row" layout-align="space-around center" layout-wrap class="mdp-calendar-days" ng-class="{ \'mdp-animate-next\': calendar.animating }" ng-show="!calendar.animating" md-swipe-left="calendar.nextMonth()" md-swipe-right="calendar.prevMonth()">' +
                        '<div layout layout-align="center center" ng-repeat-start="day in calendar.daysInMonth track by $index" ng-class="{ \'mdp-day-placeholder\': day === false }">' +
                            '<md-button class="md-icon-button md-raised" aria-label="Select day" ng-if="day !== false" ng-class="{\'md-accent\': date.date() == day.n}" ng-click="calendar.selectDate(day.n)" ng-disabled="!day.valid">{{ day.n }}</md-button>' +
                        '</div>' +
                        '<div flex="100" ng-if="($index + 1) % 7 == 0" ng-repeat-end></div>' +
                    '</div>' +
                '</div>',
        controller: ["$scope", CalendarCtrl],
        controllerAs: "calendar",
        link: function(scope, element, attrs, ctrl) {
        	var datepickerCtrl = scope.$parent.datepicker;
        	
        	scope.showYear = datepickerCtrl.showYear;
        	
            var animElements = [
                element[0].querySelector(".mdp-calendar-week-days"),
                element[0].querySelector('.mdp-calendar-days'),
                element[0].querySelector('.mdp-calendar-monthyear')
            ];
            animElements = animElements.map(function(a) {
               return angular.element(a); 
            });
                
            scope.$watch(function() { return  scope.date.format("YYYYMM") }, function(newValue, oldValue) {
                var direction = null;
                
                if(newValue > oldValue)
                    direction = "mdp-animate-next";
                else if(newValue < oldValue)
                    direction = "mdp-animate-prev";
                
                if(direction) {
                    for(var i in animElements) {
                        animElements[i].addClass(direction);
                        $animate.removeClass(animElements[i], direction);
                    }
                }
            });
        }
    }
}]);

module.directive("mdpDatePicker", ["$mdpDatePicker", "$timeout", function($mdpDatePicker, $timeout) {
    return  {
        restrict: 'A',
        require: '?ngModel',
        scope: {
        	"ngModel" : "=",
        	"minDate": "=mdpMinDate",
            "maxDate": "=mdpMaxDate",
            "useMobile" : "=?mdpUseMobile",
            "useUtc" : "=?mdpUseUtc",
            "utcOffset" : "@mdpUtcOffset",
            "fullscreen" : "=mdpFullscreen"
        },
        link: function(scope, element, attrs, ngModel) {
			if (attrs.readonly || attrs.disabled) {
				return;
			}
        	
        	if ('undefined' !== typeof attrs.type && 'date' === attrs.type.toLowerCase() && ngModel 
        			&& 'undefined' !== typeof scope.useMobile && scope.useMobile && detect.parse(navigator.userAgent).device.type.toLowerCase() === "mobile") {
        		// use mobile-system default picker
        		
        	} else {
        		var showPicker = function(ev) {
        			ev.preventDefault();
        			
    				$mdpDatePicker(ngModel.$modelValue, {
	                    targetEvent: ev,
	                    autoSwitch: scope.minDate,
	                    minDate: scope.maxDate,
	                    useUtc: scope.useUtc,
	                    utcOffset: scope.utcOffset,
	                    fullscreen: scope.fullscreen || false
	                    
	                }).then(function(selectedDate) {
	            		$timeout(function() {
	            			var normalizeMoment = function(m) {
	            		    	if (!m) {
	            		    		return undefined;
	            		    	}
	            		    	
	            		    	if (scope.useUtc) {
	            		    		m = moment.utc([m.year(), m.month(), m.date()]);
	            		    	
	            		    	} else if (scope.utcOffset) {
	            		    		m = moment.utc([m.year(), m.month(), m.date()]).utcOffset(scope.utcOffset, true);
	            		    	}
	            		    	
	            		    	return m;
	            		    };
	            			
	            			var selectedMoment = normalizeMoment(moment(selectedDate));
	            			var minMoment = scope.minDate ? normalizeMoment(moment(scope.minDate)) : null;
	            			var maxMoment = scope.maxDate ? normalizeMoment(moment(scope.maxDate)) : null;
	            			
	            			// validate min and max date
	                    	if (minMoment && maxMoment) {
	                    		if (maxMoment.isBefore(minMoment, "days")) {
	                    			maxMoment = normalizeMoment(moment(minMoment)).add(1, 'days');
	                    		}
	                    	}
	            			
	            			if (minMoment && minMoment.isValid()) {
	            				ngModel.$setValidity('mindate', selectedMoment.isSameOrAfter(minMoment, "days"));
	            			}
	            			
	            			if (maxMoment && maxMoment.isValid()) {
	            				ngModel.$setValidity('maxdate', selectedMoment.isSameOrBefore(maxMoment, "days"));
	            			}
	            			
	            			scope.ngModel = selectedMoment.toDate();
	                      });
	                  });
        		};
        		
        		element.on("click", showPicker);
 	            
 	            scope.$on("$destroy", function() {
 	                element.off("click", showPicker);
 	            });
            }
        }
    };
}]);