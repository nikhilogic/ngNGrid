# ngNGrid

This is an extensible grid control built in angular js.

Salient Features:
 - Allows to create different types of column data (button, label, custom format...)
 - Sorting capability
 - "Excel-like" Filtering capability with type-ahead feature and grouping at column level
 - Allows custom message while Loading
 - Allows animation when records are updated
 - Delegate (event based) column templates to handle action on data
 

 How to use:
 
 Step 1: Add dependency in your controller
 var appNgNgrid = angular.module('NgNgridApp', ['ngNgrid']);
 
 Step 2: Add the ng-ngrid control in your html
 <div ng-app="NgNgridApp">
        <div ng-controller="HomeController">
          
            <ng-ngrid rows="data"
                      column-definitions="columnDefs"
                      child-columndefinitions="[childColumndef1,childColumndef2]"
                      child-propertynames="['Children1','Children2']"
                      initial-pagesize="20"
                      initial-sortcolumn="aSortcolumn"
                      initial-sortdesc="aSortdesc"
                      bottom-elementids="gridbottomids"
                      show-row-numbers="true"
                      show-row-selector="true"
                      rows-loading="loadingRecords"
                      rows-loading-text="Loading records have patience"
                      grid-height-stretch-bottom-offset="0">
            </ng-ngrid>

        </div>
    </div>
 
Step 3: Add column definitions in your controller. Column definition properties will be explained in detail later

 $scope.columnDefs = [
               {
                   Name: 'Col1String',
                   DisplayName: 'String(Default Type) Column',
                   GlyphFn: function (r) { return 'glyphicon-king'; },
                   BadgeFn: function (r) { return r[this.Name].length; },
                   ClassFn: function (r) { return 'text-primary'; }
               }];
			   
Step 4: Populate rows in your controller
 $scope.data.push({Col1String: 'String data'});
 
 
Reference Column Definition Properties:

The grid supports various types of columns. (Property:  ColumnType)
(TO DO; Documentation pending...)
1. Default : String column

2. 'ngNGridLabel'

3. 'ngNGridButton'

4. 'ngNGridDate'

5. 'ngNGridInput'

6. 'ngNGridSelect'

 
Dependencies:

 AngularJs BootStrap 0.13.0  https://angular-ui.github.io/bootstrap/ 

 AngularJs 1.3.15 https://angularjs.org/
 
 Bootstrap 3.3.4 https://github.com/twbs/bootstrap
 
 


