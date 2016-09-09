### 0.7.4
* added _skipHide_ to pickers to allow multiple dialogs opening (pickers inside dialog): without _skipHide_ only one open dialog is allowed, making pickers close his container dialog. 

> updated angular version to 1.5.8 and angular-material to 1.1.1

### 0.7.3
* [mdpTimePicker] Fixed error in converting time with useUtc = false
* [mdpTimePicker] Autoswitch only if in hours view (real Android behaviour)

### 0.7.2
* Added useUtc and utcOffset options to time picker
* Optimizations on date picker

### 0.7.1
* fixed mobile picker switcher
* added year's select btn in calendar view (now you can switch to year-select's view by clicking on month-year label)
* timepicker has been upgraded to the master project's (alenaksu/mdPickers) actual version

### 0.7.0
* Added support for utc dates and utcOffset

### 0.6.4
* Added support for default mobile date/time picker
* Removed cast of selected date to its minimum time: startOf("day")
> Updated dependecies versions to latest.


### 0.6.3
* Fixed check on maxdate

### 0.6.2
* Ignored time in dates comparing; minor fix

> Updated dependecies versions to latest.

### 0.6.1
* Added capability for readonly input
> Updated dependecies versions to latest.

### 0.6.0

# features

### mdDatePicker
- Swipe capabilities
- Button 'TODAY'
- Support for min and max date
- Improved alignment of days' container

### mdTimePicker
- Button 'NOW'
- Directive *mdpTimePicker* for *input[type=time]*

> *All dependencies have been updated to their latest version*

### 0.5.0

#### Breaking Changes

* Service `$mdDatePicker` is changed to `$mdpDatePicker` 
* Directive `mdDatePicker` is changed to `mdpDatePicker` 

#### Features

* Time picker
* Dynamic year selector on date picker
* Animations
* Minor improvements 

### 0.3.2

#### Bugfixes

* Renamed classes names to avoid collisions with official date picker
* Changed angular repository in bower config

#### Features

* Added config provider for $mdDatePicker. Now is possible to set the labels of the dialog buttons with $mdDatePickerProvider.setOKButtonLabel(...) and $mdDatePickerProvider.setCancelButtonLabel(...)
* Minor improvements

### 0.3.0

#### Features

* Bower support

### 0.2.0

#### Breaking Changes

Repository name is changed to `mdPickers`. The goal is to have a both date and time pickers in the same module.

### 0.1.0

#### Features

* Date picker dialog
