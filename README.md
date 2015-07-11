# ngNGrid
 * Version: 1.0
 * License: MIT

## This is an extensible and customizable grid control built in angular js.

### Interactive Demo/Designer: 
You can customize and play around with the grid here [here](https://nikhilogic.github.io/)
In this demo, you can design the grid on the fly and download the column initialization code.

### Download :
Download using the "Download ZIP" button on the right panel. This contains minified .js and .css file.

### Salient Features:
 - Allows to create different types of column data (button, label, custom format...)
 - Sorting capability
 - "Excel-like" Filtering capability with type-ahead feature and grouping at column level
 - Allows custom message while Loading
 - Allows animation when records are updated
 - Delegate (event based) column templates to handle action on data
 - Support for range filters for date and numeric columns
 - Import and exports rows in Json format which can be overriden for custom handling.

## How to use:
 
* Step 1: Checkout the interactive grid designer here to see how you need to style your columns here [here](https://nikhilogic.github.io/) 
Design the grid on the fly and download the column definition code.
 
* Step 2: Add dependency in your controller
```javascript
	 var appNgNgrid = angular.module('NgNgridApp', ['ngNgrid']);
 ```
* Step 3: Add the ng-ngrid control in your html	
```html
	 <div ng-app="NgNgridApp">
			<div ng-controller="HomeController">
			  
				<ng-ngrid rows="data"
						  column-definitions="columnDefs"						 
						  rows-loading="loadingRecords"
						  rows-loading-text="Loading records have patience"						  
						  >
				</ng-ngrid>

			</div>
		</div>
 ```
* Step 4: Add column definitions in your controller. Column definition properties will be explained in detail later
```javascript
	 $scope.columnDefs = [
			   {
				   Name: 'Col1String',
				   DisplayName: 'String(Default Type) Column',
				   GlyphFn: function (r) { return 'glyphicon-king'; },
				   BadgeFn: function (r) { return r[this.Name].length; },
				   ClassFn: function (r) { return 'text-primary'; }
			   }];
```			   
* Step 5: Populate rows in your controller
```javascript
	 $scope.data.push({Col1String: 'String data'});
```
 
## Reference:

### Common properties for all Columns
	1. Name:  This is the property of the dataset which needs to be bound to the column. The property can be object or a simple value.
	2. DisplayName:  This is the name to be shown in the column header of the grid	
	3. DisableFilter:  (Default is false) When set to true disables the filtering capability for that column
	4. ColumnType: This can be any of the column types described below in the "Column Types" section.

### Common Functions (Callbacks)
The Grid column properties have many callback functions which allow you to override style, glyphicons, text , badge , null value substitution etc for the data in that column.
Most of the call backs give you the row object which can be queried , incase the value you want to assign to the data is a derived from other column data in that row.
Following are the call backs


	ClassFn : Allows you to set the Class for the column. It gives you the row object (r)
		eg. 
		   ClassFn: function (r) { return 'text-primary'; }

	GlyphFn : Allows you to set the Glyph for the column. It gives you the row object (r)
		eg. 
		  GlyphFn: function (r) { return 'glyphicon-king'; }
		  
	TooltipFn : Allows you to set the Tooltip for the column. It gives you the row object (r)
		eg. 
		   TooltipFn: function (r) { return 'this is my tooltip'; }

	BadgeFn : Allows you to set the Badge number for the column. It gives you the row object (r)
		eg. 
		   BadgeFn: function (r) { return 100; }

	ClassFn : Allows you to set the Class for the data for the column. It gives you the row object (r)
		eg. 
		   ClassFn: function (r) { return 'text-primary'; }	   

	BadgeClass : Allows to set the class for the badge
	
	DisabledFn: Allows to enable or disable the control by returning true (for disabling ) or false (for enabling)
	
	TextFn: Allows to set the text to display in the cell 
	
	DateFormatFn	:Allows to set the date filter for Date column type. (See ngNGridDate column in Column types)
	
	UrlFn	:Allows to set the link url for Hyperlink  column type. (See ngNGridLink column in Column types)
	
	NullOrEmptyFn: Allows to replace the null value with a custom value
	
	
	SelectFn : Allows to set the values for the dropdown in Dropdown type column (see  ngNGridSelect in Column types)
	SelectValue  :Allows to set the display value in the dropdown	
	SelectKey: Allows to set the key in the drop down to bind to row property
	
	CellClassFn : Allows to apply the class to the table cell for that row
	
	FillterClassFn : Allows setting the class for the column filter items.
	FilterTextFn : Allows setting the text to display for the column filter items. 
	FilterGlyphFn:  Allows setting the glyphicon to display for the column filter items. 
	
	
### Column Types
The grid supports various types of columns.
All the following column types can be customized using the above common Callbacks as described above

	1. Default : String column Used to display simple text values.      
	   
	2. ngNGridLabel : Used to display label in the grid data for that column.

	3. ngNGridButton : Used to display Button in the grid data for that column.

	4. ngNGridDate : Used to display Date in the grid data for that column. Comes with ranged search filter.

	5. ngNGridInput : Used to display Input fields in the grid data for that column.

	6. ngNGridSelect : Used to display Select dropdown in the grid data for that column.

	7. ngNGridLink : Used to display hyperlink in the grid data for that column.
	
	8. ngNGridNumber : Used to display number columns. Comes with ranged search filter.
	
 
 
### Grid HTML binding properties
	
	column-definitions -> array of column definition objects
	child-columndefinitions -> array of child column definition objects
	child-propertynames  -> array of strings representing the property names of the child rows to bind to the parent row
	rows  -> the array of records to bind to the grid
	rows-loading -> boolean variable which indicates whether rows are still loading in the grid. This triggers the "loading" animation in the grid
	rows-loading-text -> string  which indicates the text to show when records are loading					  	
	initial-pagesize (optional: default 15)  -> number representing the initial number of records to show in one page of the grid
	initial-sortcolumn (optional: default:none) -> string ;name of the column representing  the initial column to sort 
	initial-sortdesc (optional default:none) -> boolean : whether to sort the initial sort column as descending                      
	show-row-numbers (optional: default:false) -> boolean variable: show row number column by default
	show-row-selector (optional: default:false) -> boolean variable: show row selector column by default	
	grid-height-stretch-bottom-offset (optional : default:0)-> number indicating the grid should stretch available height on the page except the offset passed
	OR
	gridHeightFixed -> indicates the grid height is fixed 
	notifyGridFiltersChanged -> call back function to assign when Grid filters are changed.
			Parameters passed : ( filterColumnName: column name to which filter is applied or removed (this is empty for when all grid filters are removed) , filters: filters added/removed for the column, isAdded: indicates if filter is added or removed )
	onDataImport -> callback function to assign when import action starts. Here you can override or cancel the event.
			Parameter passed : ngNgridImportObject (contains two properties :   Rows: rows which are parsed for import , CancelEvent: boolean indicating whether to cancel the import
	onDataExport -> callback function to assign when export action starts. Here you can override or cancel the event.
			Parameter passed : ngNgridExportObject (contains two properties :   Rows: rows which are parsed for import , CancelEvent: boolean indicating whether to cancel the import
	addColumnFilters (optional: default:none) -> function to call when adding filters to grid from hosting control.
			Parameters to be passed : (column name, array of filter strings to be applied for the column)
	showSettings (optional: default:false) -> Indicates whether the settings menu is expanded initially by default
	rememberFilters (optional: default:true) -> Indicates whether the grid remembers the filters for every column during the browser session.
	
   
Dependencies:

 AngularJs BootStrap 0.13.0  https://angular-ui.github.io/bootstrap/ 

 AngularJs 1.3.15 https://angularjs.org/
 
 Bootstrap 3.3.4 https://github.com/twbs/bootstrap
 
 


