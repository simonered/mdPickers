(function() {
"use strict";
var module = angular.module("mdPickers", [
	"ngMaterial",
	"ngAnimate",
	"ngAria"
]); 
/* global = */

function DatePickerCtrl($scope, $mdDialog, $mdMedia, $timeout, currentDate, minDate, maxDate, useUtc, utcOffset) {
    var self = this;

    this.currentDate = currentDate;
    this.currentMoment = moment(self.currentDate);
    this.minMoment = minDate ? moment(minDate).startOf("day") : null;
    this.maxMoment = maxDate ? moment(maxDate).startOf("day") : null;
    this.selectingYear = false;

    $scope.$mdMedia = $mdMedia;
    
    this.init = function() {
    	// convert moments to utc/utcOffset
    	this.currentMoment = this.normalizeMoment(this.currentMoment);
    	this.minMoment = this.normalizeMoment(this.minMoment);
    	this.maxMoment = this.normalizeMoment(this.maxMoment);
    	
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
    
    this.normalizeMoment = function(m) {
    	if (!m) {
    		return undefined;
    	}
    	
    	if (useUtc) {
    		m = moment.utc([m.year(), m.month(), m.date()]);
    	
    	} else if (utcOffset) {
    		m = moment.utc([m.year(), m.month(), m.date()]).utcOffset(utcOffset, true);
    	}
    	
    	return m;
    };
    
    // init
    this.init();
    
    $scope.year = this.currentMoment.year();

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
    	self.currentMoment = this.normalizeMoment(moment());
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
        var datePicker = function(targetEvent, currentDate, minDate, maxDate, useUtc, utcOffset) {
            if (!angular.isDate(currentDate)) currentDate = Date.now();
            if (!angular.isDate(minDate)) minDate = null;
            if (!angular.isDate(maxDate)) maxDate = null;
            if (!useUtc || "undefined" === typeof useUtc) useUtc = false;
    
            return $mdDialog.show({
                controller:  ['$scope', '$mdDialog', '$mdMedia', '$timeout', 'currentDate', 'minDate', 'maxDate', 'useUtc', 'utcOffset', DatePickerCtrl],
                controllerAs: 'datepicker',
                clickOutsideToClose: true,
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
                targetEvent: targetEvent,
                locals: {
                    currentDate: currentDate,
                    minDate: minDate, 
                    maxDate: maxDate,
                    useUtc: useUtc, 
                    utcOffset: utcOffset
                }
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
    this.updateDaysInMonth();
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
            "useMobile" : "=mdpUseMobile",
            "useUtc" : "=mdpUseUtc",
            "utcOffset" : "=mdpUtcOffset"
        },
        link: function(scope, element, attrs, ngModel) {
			if (attrs.readonly || attrs.disabled) {
				return;
			}
        	
            if ('undefined' !== typeof attrs.type && 'date' === attrs.type && ngModel) {
            	if ('undefined' !== typeof scope.useMobile && scope.useMobile && detect.parse(navigator.userAgent).device.type.toLowerCase() === "mobile") {
            		// use mobile-system default picker
            		
            	} else {
	                angular.element(element).on("click", function(ev) {
	                	ev.preventDefault();
	                	
	                	$mdpDatePicker(ev, ngModel.$modelValue, scope.minDate, scope.maxDate, scope.useUtc, scope.utcOffset).then(function(selectedDate) {
	                		$timeout(function() {
	                			var selectedMoment = moment(selectedDate);
	                			var minMoment = scope.minDate ? moment(scope.minDate) : null;
	                			var maxMoment = scope.maxDate ? moment(scope.maxDate) : null;
	                			
	                			// validate min and max date
	                        	if (minMoment && maxMoment) {
	                        		if (maxMoment.isBefore(minMoment, "days")) {
	                        			maxMoment = moment(minMoment).add(1, 'days');
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
	                });
            	}
            }
        }
    };
}]);
function TimePickerCtrl($scope, $mdDialog, time, autoSwitch, $mdMedia) {
	var self = this;
    this.VIEW_HOURS = 1;
    this.VIEW_MINUTES = 2;
    this.currentView = this.VIEW_HOURS;
    this.time = moment(time);
    this.autoSwitch = !!autoSwitch;
    
    this.clockHours = parseInt(this.time.format("h"));
    this.clockMinutes = parseInt(this.time.minutes());
    
	$scope.$mdMedia = $mdMedia;
		
	this.switchView = function() {
	    self.currentView = self.currentView == self.VIEW_HOURS ? self.VIEW_MINUTES : self.VIEW_HOURS;
	};
    
	this.setAM = function() {
        if(self.time.hours() >= 12)
            self.time.hour(self.time.hour() - 12);
	};
    
    this.setPM = function() {
        if(self.time.hours() < 12)
            self.time.hour(self.time.hour() + 12);
	};
	
	this.now = function() {
		self.time = moment();
	};
    
    this.cancel = function() {
        $mdDialog.cancel();
    };

    this.confirm = function() {
        $mdDialog.hide(this.time.toDate());
    };
}

function ClockCtrl($scope) {
    var TYPE_HOURS = "hours";
    var TYPE_MINUTES = "minutes";
    var self = this;
    
    this.STEP_DEG = 360 / 12;
    this.steps = [];
    
    this.CLOCK_TYPES = {
        "hours": {
            range: 12,
        },
        "minutes": {
            range: 60,
        }
    }
    
    this.getPointerStyle = function() {
        var divider = 1;
        switch(self.type) {
            case TYPE_HOURS:
                divider = 12;
                break;
            case TYPE_MINUTES:
                divider = 60;
                break;
        }  
        var degrees = Math.round(self.selected * (360 / divider)) - 180;
        return { 
            "-webkit-transform": "rotate(" + degrees + "deg)",
            "-ms-transform": "rotate(" + degrees + "deg)",
            "transform": "rotate(" + degrees + "deg)"
        }
    };
    
    this.setTimeByDeg = function(deg) {
        deg = deg >= 360 ? 0 : deg;
        var divider = 0;
        switch(self.type) {
            case TYPE_HOURS:
                divider = 12;
                break;
            case TYPE_MINUTES:
                divider = 60;
                break;
        }  
        
        self.setTime(
            Math.round(divider / 360 * deg)
        );
    };
    
    this.setTime = function(time) {
        this.selected = time;
        
        switch(self.type) {
            case TYPE_HOURS:
                if(self.time.format("A") == "PM") time += 12;
                this.time.hours(time);
                break;
            case TYPE_MINUTES:
                if(time > 59) time -= 60;
                this.time.minutes(time);
                break;
        }
        
    };
    
    this.init = function() {
        self.type = self.type || "hours";
        switch(self.type) {
            case TYPE_HOURS:
                for(var i = 1; i <= 12; i++)
                    self.steps.push(i);
                self.selected = self.time.hours() || 0;
                if(self.selected > 12) self.selected -= 12;
                    
                break;
            case TYPE_MINUTES:
                for(var i = 5; i <= 55; i+=5)
                    self.steps.push(i);
                self.steps.push(0);
                self.selected = self.time.minutes() || 0;
                
                break;
        }
    };
    
    this.init();
}

module.directive("mdpClock", ["$animate", "$timeout", function($animate, $timeout) {
    return {
        restrict: 'E',
        bindToController: {
            'type': '@?',
            'time': '=',
            'autoSwitch': '=?'
        },
        replace: true,
        template: '<div class="mdp-clock">' +
                        '<div class="mdp-clock-container">' +
                            '<md-toolbar class="mdp-clock-center md-primary"></md-toolbar>' +
                            '<md-toolbar ng-style="clock.getPointerStyle()" class="mdp-pointer md-primary">' +
                                '<span class="mdp-clock-selected md-button md-raised md-primary"></span>' +
                            '</md-toolbar>' +
                            '<md-button ng-class="{ \'md-primary\': clock.selected == step }" class="md-icon-button md-raised mdp-clock-deg{{ ::(clock.STEP_DEG * ($index + 1)) }}" ng-repeat="step in clock.steps" ng-click="clock.setTime(step)">{{ step }}</md-button>' +
                        '</div>' +
                    '</div>',
        controller: ["$scope", ClockCtrl],
        controllerAs: "clock",
        link: function(scope, element, attrs, ctrl) {
            var pointer = angular.element(element[0].querySelector(".mdp-pointer")),
                timepickerCtrl = scope.$parent.timepicker;
            
            var onEvent = function(event) {
                var containerCoords = event.currentTarget.getClientRects()[0];
                var x = ((event.currentTarget.offsetWidth / 2) - (event.pageX - containerCoords.left)),
                    y = ((event.pageY - containerCoords.top) - (event.currentTarget.offsetHeight / 2));

                var deg = Math.round((Math.atan2(x, y) * (180 / Math.PI)));
                $timeout(function() {
                    ctrl.setTimeByDeg(deg + 180);
                    if(ctrl.autoSwitch && ["mouseup", "click"].indexOf(event.type) !== -1 && timepickerCtrl) timepickerCtrl.switchView();
                });
            }; 
            
            element.on("mousedown", function() {
               element.on("mousemove", onEvent);
            });
            
            element.on("mouseup", function(e) {
                element.off("mousemove");
            });
            
            element.on("click", onEvent);
            scope.$on("$destroy", function() {
                element.off("click", onEvent);
                element.off("mousemove", onEvent); 
            });
        }
    }
}]);

module.provider("$mdpTimePicker", function() {
    var LABEL_OK = "OK",
        LABEL_CANCEL = "Cancel",
        LABEL_NOW = "Now";
        
    this.setOKButtonLabel = function(label) {
        LABEL_OK = label;
    };
    
    this.setCancelButtonLabel = function(label) {
        LABEL_CANCEL = label;
    };
    
    this.setNowButtonLabel = function(label) {
    	LABEL_NOW = label;
    };
    
    this.$get = ["$mdDialog", function($mdDialog) {
        var timePicker = function(time, options) {
            if(!angular.isDate(time)) time = Date.now();
            if (!angular.isObject(options)) options = {};
    
            return $mdDialog.show({
                controller:  ['$scope', '$mdDialog', 'time', 'autoSwitch', '$mdMedia', TimePickerCtrl],
                controllerAs: 'timepicker',
                clickOutsideToClose: true,
                template: '<md-dialog aria-label="" class="mdp-timepicker" ng-class="{ \'portrait\': !$mdMedia(\'gt-xs\') }">' +
                            '<md-dialog-content layout-gt-xs="row" layout-wrap>' +
                                '<md-toolbar layout-gt-xs="column" layout-xs="row" layout-align="center center" flex class="mdp-timepicker-time md-hue-1 md-primary">' +
                                    '<div class="mdp-timepicker-selected-time">' +
                                        '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_HOURS }" ng-click="timepicker.currentView = timepicker.VIEW_HOURS">{{ timepicker.time.format("h") }}</span>:' + 
                                        '<span ng-class="{ \'active\': timepicker.currentView == timepicker.VIEW_MINUTES }" ng-click="timepicker.currentView = timepicker.VIEW_MINUTES">{{ timepicker.time.format("mm") }}</span>' +
                                    '</div>' +
                                    '<div layout="column" class="mdp-timepicker-selected-ampm">' + 
                                        '<span ng-click="timepicker.setAM()" ng-class="{ \'active\': timepicker.time.hours() < 12 }">AM</span>' +
                                        '<span ng-click="timepicker.setPM()" ng-class="{ \'active\': timepicker.time.hours() >= 12 }">PM</span>' +
                                    '</div>' + 
                                '</md-toolbar>' +
                                '<div>' +
                                    '<div class="mdp-clock-switch-container" ng-switch="timepicker.currentView" layout layout-align="center center">' +
	                                    '<mdp-clock class="mdp-animation-zoom" auto-switch="timepicker.autoSwitch" time="timepicker.time" type="hours" ng-switch-when="1"></mdp-clock>' +
	                                    '<mdp-clock class="mdp-animation-zoom" auto-switch="timepicker.autoSwitch" time="timepicker.time" type="minutes" ng-switch-when="2"></mdp-clock>' +
                                    '</div>' +
                                    
                                    '<md-dialog-actions layout="row">' +
                                    	'<md-button ng-click="timepicker.now()" aria-label="' + LABEL_NOW + '">' + LABEL_NOW + '</md-button>' +
	                                	'<span flex></span>' +
                                        '<md-button ng-click="timepicker.cancel()" aria-label="' + LABEL_CANCEL + '">' + LABEL_CANCEL + '</md-button>' +
                                        '<md-button ng-click="timepicker.confirm()" class="md-primary" aria-label="' + LABEL_OK + '">' + LABEL_OK + '</md-button>' +
                                    '</md-dialog-actions>' +
                                '</div>' +
                            '</md-dialog-content>' +
                        '</md-dialog>',
                targetEvent: options.targetEvent,
                locals: {
                    time: time,
                    autoSwitch: options.autoSwitch
                },
                skipHide: true
            });
        };
    
        return timePicker;
    }];
});

module.directive("mdpTimePicker", ["$mdpTimePicker", "$timeout", function($mdpTimePicker, $timeout) {
    return  {
        restrict: 'E',
        require: 'ngModel',
        transclude: true,
        template: function(element, attrs) {
            var noFloat = angular.isDefined(attrs.mdpNoFloat),
                placeholder = angular.isDefined(attrs.mdpPlaceholder) ? attrs.mdpPlaceholder : "",
                openOnClick = angular.isDefined(attrs.mdpOpenOnClick) ? true : false;
            
            return '<div layout layout-align="start start">' +
                    '<md-button class="md-icon-button" ng-click="showPicker($event)"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + '>' +
                        '<md-icon md-svg-icon="mdp-access-time"></md-icon>' +
                    '</md-button>' +
                    '<md-input-container' + (noFloat ? ' md-no-float' : '') + ' md-is-error="isError()">' +
                        '<input type="{{ ::type }}"' + (angular.isDefined(attrs.mdpDisabled) ? ' ng-disabled="disabled"' : '') + ' aria-label="' + placeholder + '" placeholder="' + placeholder + '"' + (openOnClick ? ' ng-click="showPicker($event)" ' : '') + ' />' +
                    '</md-input-container>' +
                '</div>';
        },
        scope: {
            "timeFormat": "@mdpFormat",
            "placeholder": "@mdpPlaceholder",
            "autoSwitch": "=?mdpAutoSwitch",
            "disabled": "=?mdpDisabled"
        },
        link: function(scope, element, attrs, ngModel, $transclude) {
            var inputElement = angular.element(element[0].querySelector('input')),
                inputContainer = angular.element(element[0].querySelector('md-input-container')),
                inputContainerCtrl = inputContainer.controller("mdInputContainer");
                
            $transclude(function(clone) {
               inputContainer.append(clone); 
            });
            
            var messages = angular.element(inputContainer[0].querySelector("[ng-messages]"));
            
            scope.type = scope.timeFormat ? "text" : "time"
            scope.timeFormat = scope.timeFormat || "HH:mm";
            scope.autoSwitch = scope.autoSwitch || false;
            
            scope.$watch(function() { return ngModel.$error }, function(newValue, oldValue) {
                inputContainerCtrl.setInvalid(!ngModel.$pristine && !!Object.keys(ngModel.$error).length);
            }, true);
            
            // update input element if model has changed
            ngModel.$formatters.unshift(function(value) {
                var time = angular.isDate(value) && moment(value);
                if(time && time.isValid()) 
                    updateInputElement(time.format(scope.timeFormat));
                else
                    updateInputElement(null);
            });
            
            ngModel.$validators.format = function(modelValue, viewValue) {
                return !viewValue || angular.isDate(viewValue) || moment(viewValue, scope.timeFormat, true).isValid();
            };
            
            ngModel.$validators.required = function(modelValue, viewValue) {
                return angular.isUndefined(attrs.required) || !ngModel.$isEmpty(modelValue) || !ngModel.$isEmpty(viewValue);
            };
            
            ngModel.$parsers.unshift(function(value) {
                var parsed = moment(value, scope.timeFormat, true);
                if(parsed.isValid()) {
                    if(angular.isDate(ngModel.$modelValue)) {
                        var originalModel = moment(ngModel.$modelValue);
                        originalModel.minutes(parsed.minutes());
                        originalModel.hours(parsed.hours());
                        originalModel.seconds(parsed.seconds());
                        
                        parsed = originalModel;
                    }
                    return parsed.toDate(); 
                } else
                    return null;
            });
            
            // update input element value
            function updateInputElement(value) {
                inputElement[0].value = value;
                inputContainerCtrl.setHasValue(!ngModel.$isEmpty(value));
            }
            
            function updateTime(time) {
                var value = moment(time, angular.isDate(time) ? null : scope.timeFormat, true),
                    strValue = value.format(scope.timeFormat);

                if(value.isValid()) {
                    updateInputElement(strValue);
                    ngModel.$setViewValue(strValue);
                } else {
                    updateInputElement(time);
                    ngModel.$setViewValue(time);
                }
                
                if(!ngModel.$pristine && 
                    messages.hasClass("md-auto-hide") && 
                    inputContainer.hasClass("md-input-invalid")) messages.removeClass("md-auto-hide");
                
                ngModel.$render();
            }
                
            scope.showPicker = function(ev) {
                $mdpTimePicker(ngModel.$modelValue, {
                    targetEvent: ev,
                    autoSwitch: scope.autoSwitch
                }).then(function(time) {
                    updateTime(time, true);
                });
            };
            
            function onInputElementEvents(event) {
                if(event.target.value !== ngModel.$viewVaue)
                    updateTime(event.target.value);
            }
            
            inputElement.on("reset input blur", onInputElementEvents);
            
            scope.$on("$destroy", function() {
                inputElement.off("reset input blur", onInputElementEvents);
            })
        }
    };
}]);

module.directive("mdpTimePicker", ["$mdpTimePicker", "$timeout", function($mdpTimePicker, $timeout) {
    return  {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            "timeFormat": "@mdpFormat",
            "useMobile" : "=mdpUseMobile",
        	"autoSwitch" : "=?mdpAutoSwitch"
        },
        link: function(scope, element, attrs, ngModel, $transclude) {
        	if ('undefined' !== typeof attrs.type && 'time' === attrs.type && ngModel 
        			&& 'undefined' !== typeof scope.useMobile && scope.useMobile && detect.parse(navigator.userAgent).device.type.toLowerCase() === "mobile") {
        		// use mobile-system default picker
        		
        	} else {        	
	            scope.timeFormat = scope.timeFormat || "HH:mm";
	            
	            function showPicker(ev) {
	                $mdpTimePicker(ngModel.$modelValue, {
	                    targetEvent: ev,
	                    autoSwitch: scope.autoSwitch
	                    
	                }).then(function(time) {
	                    ngModel.$setViewValue(moment(time).format(scope.timeFormat));
	                    ngModel.$render();
	                });
	            };
	            
	            element.on("click", showPicker);
	            
	            scope.$on("$destroy", function() {
	                element.off("click", showPicker);
	            });
        	}
        }
    }
}]);
})();