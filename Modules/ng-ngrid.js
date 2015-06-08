﻿/* 

TODO: format this later
     columnDefinitions: '=',
            childColumndefinitions: '=',
            childPropertynames: '@',
            rowFooterdefinitions: '=',
            rows: '=',
            rowsLoading: '=',
            rowsLoadingText: '@',            
            gridSortColumn: '=initialSortcolumn',
            gridSortOrder: '=initialSortdesc',
            gridFilters: '=',
            showRowNumbers: '=',
            gridHeightFixed: '=',
            gridHeightStretchBottomOffset: '='                   
 */



angular.module('ngNgrid', ['ui.bootstrap'])
.directive('ngNgrid', function ($filter, $window, $timeout) {

    function link(scope, element, attrs) {
        scope.pageSizeOptions = [10, 15, 20, 50, 100, 500, 1000];
        scope.gridCurrentPage = 1;        
        scope.gridChildrenSortOrder = false;
        scope.gridChildrenSortColumn = '';
        scope.customFilter = [];
        scope.customFilter.ColumnFilters = [];
        scope.filterSelectionList = [];
        scope.distinctLists = [];

        /*
         * Grid scrolling
         * Sets the scroll area as per the stretch bottom offset or fixed height defined 
         */
        scope.setGridTableStyle = function () {
            var topPosition = document.getElementById('ngGridToolbar').getBoundingClientRect().bottom;
            var bottomPosition = 0;
            if (scope.gridHeightStretchBottomOffset != null) {
                bottomPosition = scope.gridHeightStretchBottomOffset;
            }
            else {
                bottomPosition = window.innerHeight - scope.gridHeightFixed - document.getElementById('ngGridToolbar').getBoundingClientRect().top;
            }
            return { top: topPosition + 'px', bottom: bottomPosition + 'px' };
        };

        /*
         * Grid paging
         * Calculates the total number of pages to set in the pagination control
         */
        scope.gridTotalPages = function () {
            return Math.ceil(scope.rows.length / scope.gridPageSize);
        }         

        /*
         * Grid Sorting
         * Toggles the sort on user interaction
         */
        scope.changeSort = function (sortCol) {
            scope.gridSortOrder = !scope.gridSortOrder;
            scope.gridSortColumn = scope.getSortProperty(sortCol);
        }

        /*
         * Grid Sorting
         * Toggle the sort on the child tables
         */
        scope.changeChildSort = function (sortCol) {
            scope.gridChildrenSortOrder = !scope.gridChildrenSortOrder;
            scope.gridChildrenSortColumn = scope.getSortProperty(sortCol);
        }

        /*
         * Grid Sorting
         * Checks if the column is sorted to render the glyph icon indicators
         */
        scope.isSorted = function (sortCol) {
            return (scope.gridSortColumn == scope.getSortProperty(sortCol));
        }
        
        /*
         * Grid Sorting
         * Checks if the child column is sorted to render the glyph icon indicators
         */
        scope.isChildSorted = function (sortCol) {
            return (scope.gridChildrenSortColumn == scope.getSortProperty(sortCol));
        }

        /*
         * Grid Sorting
         * Gets the sort property set on the column. Default sort property is the column Name property
         */
        scope.getSortProperty = function (col) {
            var colName = null;
            if (col.SortProperty != null) {
                colName = col.Name + '.' + col.SortProperty;
            }
            else {
                colName = col.Name;
            }
            return colName;
        }

        /*
         * Grid Row function
         * Gets the value of the property in an object "O" from a specified string  in "A.B.C" format in O["A"]["B"]["C"] 
         */
        scope.getValueFromPropertyString = function (targetObject, propString) {
            var objValue = null;
            if (propString != null) {
                var arrSplitSortProp = propString.split('.');
                for (var i = 0; i < arrSplitSortProp.length; i++) {
                    if (i == 0) {
                        objValue = targetObject[arrSplitSortProp[i]];
                    }
                    else if (objValue == null) {
                        break;
                    }
                    else {
                        objValue = objValue[arrSplitSortProp[i]];
                    }
                }
            }
            return objValue;
        }

        scope.getChildRows = function (row, childColName) {
            return scope.getValueFromPropertyString(row, childColName);
        }

        scope.childRowsCount = function (row) {
            var childRecCount = 0;
            for (var i = 0; i < scope.childPropertynames.length; i++) {
                var tempChildRows = scope.getValueFromPropertyString(row, scope.childPropertynames[i]);
                childRecCount += tempChildRows ? tempChildRows.length : 0;
            }
            return childRecCount;
        }

        scope.getColValue = function (col, row) {
            var val = null;
            if (row[col.Name] != null) {
                if (col.SortProperty != null) {
                    val = scope.getValueFromPropertyString(row[col.Name], col.SortProperty);
                }
                else {
                    val = row[col.Name];
                }
            }
            return val;
        }

        scope.distinctChildColValues = function (col, row) {
            var distinctValues = [];
            var colName = scope.getSortProperty(col);
            for (i = 0, len = row[scope.childPropertynames].length ; i < len; i++) {
                var colValue = scope.getColValue(col, row[scope.childPropertynames][i]);
                if (colValue != null) {
                    if (distinctValues.indexOf(colValue) == -1) {
                        distinctValues.push(colValue);
                    }
                }
            }
            distinctValues.sort();
            return distinctValues;
        };
            

        /*
         * Grid Filters
         * Gets the distinct values in the rows for that column. The distinct Value is an object with three properties :
         *  1. DistinctValue -  which is the actual value of the object property in the row
         *  2. DistinctCount - count of the distinct value (grouping)
         *  3. DisplayValue -  How the value is displayed in the filter
         */
        scope.distinctColValues = function (col, rowSet) {            
            var distinctValues = [];
            //Iterate over the rows for that column to group distinct values
            for (i = 0, len = rowSet.length ; i < len; i++) {                
                var colValue = scope.getColValue(col, rowSet[i]);
                if (colValue != null) {                    
                    var matchFound = false;
                    //look for colValue in DistinctValue
                    for (var j = 0; j < distinctValues.length; j++) {
                        if (distinctValues[j].DistinctValue == colValue) {
                            //Value already exists; so increment the counter in the distinctValues array for that value.
                            matchFound = true;
                            distinctValues[j].DistinctCount += 1;
                            break;
                        }
                    }
                    if (!matchFound) {
                        //new value found add to the distinctValues array
                        var colDisplayValue = col.FilterTextFn ? col.FilterTextFn({ DistinctValue: colValue, DistinctCount: -1 }) : colValue;
                        if (col.ColumnType == 'ngNGridDate') {
                            colDisplayValue = $filter('date')(colDisplayValue, col.FilterDateFormatFn(null));
                        }
                        
                        distinctValues.push({ DistinctValue: colValue, DistinctCount: 1, DisplayValue: colDisplayValue });
                    }
                }
            }            
            return distinctValues;            
        };

               

        /*
        * Grid Filters
        * Sets the distinct values for the list in the column on expanding the filter menu
        */        
        scope.setDistinctColValuesFiltered = function (col) {
            var colName = scope.getSortProperty(col);            
            var filteredRows = scope.gridFilteredRows;
            //Populate distinct values from the entire rows if this is the first filter applied or no other filter applied            
            if (filteredRows.length == scope.rows.length || (scope.customFilter.ColumnFilters[colName] != null && scope.customFilter.ColumnFilters[colName].IsFirstFilter)) {
                scope.distinctLists[colName] = scope.distinctColValues(col, scope.rows);
            }
            else if (!scope.isColNameFilterApplied(colName)) {
                // populate the filter list only when the filter does not already exist for the rows and we are not the first filtered column                
                scope.distinctLists[colName] = scope.distinctColValues(col, filteredRows);
            }            
        }
        
        /*
        * Grid Filters
        * Toggle column filters
        */   
        scope.toggleColFilters = function (col) {
            var colName = scope.getSortProperty(col);
            //if Filter is already applied clear the filters
            if (scope.isColNameFilterApplied(colName)) {
                //clear all filters
                delete scope.customFilter.ColumnFilters[colName];
                scope.gridFiltersChanged({ filterColumnName: colName, filterString: '', isAdded: false });
            }
            else {
                //apply the filters for all values which are filtered in drop down list                
                for (var i = 0; i < col.DropdownFilteredObjects.length; i++) {
                    scope.addColumnFilter(col, col.DropdownFilteredObjects[i].DistinctValue);
                    scope.gridFiltersChanged({ filterColumnName: colName, filterString: col.DropdownFilteredObjects[i].DistinctValue, isAdded: true });
                }
            }
        }


        /*
         * Grid Filters
         * Event for the parent control to set the filters
         */
        scope.$on('ngNGrid_FilterChange', function (event, filterCol, filterString) {
            scope.addColumnFilter(filterCol, filterString);
        });

        /*
         * Grid Filters
         * Sets or removes the filters for columns
         */
        scope.addColumnFilter = function (col, filterString) {            
            if (filterString != null) {
                var colName = scope.getSortProperty(col);
                filterString = filterString.toString().trim().toLowerCase();
                //Is this the first filter?
                var firstFilter = false;
                if (Object.keys(scope.customFilter.ColumnFilters).length <= 0) {
                    firstFilter = true;
                }
                //initialise the ColumnFilter object
                if (scope.customFilter.ColumnFilters[colName] == null) {
                    scope.customFilter.ColumnFilters[colName] = [];
                }
                //Does the filter exists -if it exists toggle it . if it dosent then add it               
                var posFilter = scope.customFilter.ColumnFilters[colName].indexOf(filterString);
                if (posFilter == -1) {

                    //item  not found - add it
                    scope.customFilter.ColumnFilters[colName].push(filterString);
                    //Is this column already the FirstFilter?
                    if (!scope.customFilter.ColumnFilters[colName].IsFirstFilter) {
                        scope.customFilter.ColumnFilters[colName].IsFirstFilter = firstFilter;
                    }
                    //notify hosting control that filters have changed
                    scope.gridFiltersChanged({ filterColumnName: colName, filterString: filterString, isAdded: true });
                }
                else {

                    //item exists toggle - remove it
                    scope.customFilter.ColumnFilters[colName].splice(posFilter, 1);
                    if (scope.customFilter.ColumnFilters[colName].length == 0) {
                        delete scope.customFilter.ColumnFilters[colName];
                        //set the first filter to the next immediate column
                        for (var cFilter in scope.customFilter.ColumnFilters) {
                            if (scope.isColNameFilterApplied(cFilter)) {
                                scope.customFilter.ColumnFilters[cFilter].IsFirstFilter = true;
                                break;
                            }
                        }
                    }
                    //notify hosting control that filters have changed
                    scope.gridFiltersChanged({ filterColumnName: colName, filterString: filterString, isAdded: false });
                }
                               
            }
        }
            

        scope.isColFilterApplied = function (col) {
            var colName = scope.getSortProperty(col);
            return scope.isColNameFilterApplied(colName);
        }

        scope.isColNameFilterApplied = function (colName) {
            return (scope.customFilter.ColumnFilters[colName] != null);
        }

        scope.isColFiltered = function (col, filterString) {
            if (scope.customFilter.ColumnFilters == null || scope.customFilter.ColumnFilters == []) return false;
            if (filterString != null) {
                filterString = filterString.toString().toLowerCase();
                var colName = scope.getSortProperty(col);
                if (scope.customFilter.ColumnFilters[colName] != null) {
                    return (scope.customFilter.ColumnFilters[colName].indexOf(filterString) > -1);
                }
            }
            else {
                return false;
            }
        }

        scope.clearAllFilters = function () {
            scope.customFilter.ColumnFilters = [];
            scope.gridFiltersChanged({ filterColumnName: '', filterString: '', isAdded: false });
        }

        scope.anyFiltersExist = function () {
            if (scope.customFilter.ColumnFilters == null || scope.customFilter.ColumnFilters == [] || Object.keys(scope.customFilter.ColumnFilters) <= 0) return false;
            for (var prop in scope.customFilter.ColumnFilters) {
                if (scope.customFilter.ColumnFilters[prop] != null) return true;
            }
            return false;
        }

        scope.getStyle = function () {
            if (scope.gridHeightStretchBottomOffset != null) {
                //stretch to window                
                return { height: window.innerHeight - document.getElementById('ngGridToolbar').getBoundingClientRect().top - scope.gridHeightStretchBottomOffset + 'px', width: 100 + '%' };
            }
            else {
                return { height: scope.gridHeightFixed + 'px', width: 100 + '%' };
            }
        }

        scope.canShowRecord = function (row) {
            if (scope.customFilter != null && scope.customFilter.ColumnFilters != null) {
                if (Object.keys(scope.customFilter.ColumnFilters).length > 0) {
                    var rowMatched = true;
                    for (var prop in scope.customFilter.ColumnFilters) {
                        var filtersForCol = scope.customFilter.ColumnFilters[prop];
                        var colMatched = false;
                        for (var j = 0; j < filtersForCol.length; j++) {

                            var field = null;
                            if (prop.indexOf('.') <= -1) {

                                field = row[prop];
                            }
                            else {
                                var splitProp = prop.split('.');
                                field = row[splitProp[0]][splitProp[1]];
                            }
                            field = field.toString();
                            if (field.toLowerCase() == filtersForCol[j]) {
                                colMatched = true;
                                break;//out of the filter for that column
                            }
                        }
                        rowMatched = rowMatched && colMatched;
                    }
                    return rowMatched;
                }
            }
            return true; //no filters for the row
        }

        scope.allRowsSelected = false;

        scope.toggleRowsSelect = function () {
            for (var i = 0; i < scope.rows.length; i++) {
                scope.rows[i].isNgngridSelected = !scope.allRowsSelected;
            }
            scope.allRowsSelected = !scope.allRowsSelected;
        }


        scope.on_fileUpload = function (element) {
            var rowsToImport = [];
            scope.files = [];
            for (var i = 0; i < element.files.length; i++) {                
                var reader = new FileReader();
                reader.readAsText(element.files[i]);
                reader.onload = function (e) {                    
                    var arrRows = angular.fromJson(reader.result);
                    var colDates = [];
                    //do we have any date columns?
                    for (var c = 0; c < scope.columnDefinitions.length; c++) {
                        if (scope.columnDefinitions[c].Type == 'Date') {                            
                            colDates.push(scope.columnDefinitions[c].Name);
                        }
                    }
                    for (var j = 0; j < arrRows.length; j++) {
                        //check for any date objects
                        for (var c = 0; c < colDates.length; c++) {
                            if (arrRows[j][colDates[c]] != null) {                                
                                arrRows[j][colDates[c]] = new Date(arrRows[j][colDates[c]]);
                            }
                        }
                        rowsToImport.push(arrRows[j]);
                        //scope.rows.unshift(arrRows[j]);
                    }
                    //allow hosting control to override it
                    scope.onDataImport(rowsToImport, cancel);
                    if (!cancel) {
                        for (var k = 0; k < rowsToImport.length; k++) {
                            scope.rows.unshift(rowsToImport[k]);
                        }
                        scope.$apply();
                    }
                }
            }
        };


        scope.importFromJson = function () {
            var fileUpload = document.getElementById("fileUploadJson");
            fileUpload.click();
        }

        scope.isAnyRowSelected = function () {
            for (var i = 0; i < scope.rows.length; i++) {
                if (scope.rows[i].isNgngridSelected) {
                    return true;
                }
            }
            return false;
        }
        scope.exportSelectedToJson = function () {
            var selectedRows = [];
            for (var i = 0; i < scope.rows.length; i++) {
                if (scope.rows[i].isNgngridSelected) {
                    selectedRows.push(scope.rows[i]);
                }
            }
            scope.onDataExport(selectedRows, cancel);
            if (!cancel) {
                var blobObject = new Blob([angular.toJson(selectedRows)]);
                window.navigator.msSaveBlob(blobObject, 'ngNGridExport.json'); // The user only has the option of clicking the Save button.            
            }            
        }

        scope.ondropDownToggle = function (c, e) {            
            if (c.isNgngridDropdownOpen) {                
                scope.setDistinctColValuesFiltered(c);
                $timeout(function () { document.getElementById(e).focus(); }, 100);
            }
        }

        scope.dropdownFilterKeyPress = function (event,c) {
            if (event.keyCode == 13) {
                scope.toggleColFilters(c);
                c.isNgngridDropdownOpen = false;
            }

        }
    }

    return {
        restrict: 'E',
        scope: {
            columnDefinitions: '=',
            childColumndefinitions: '=',
            childPropertynames: '=',
            rowFooterdefinitions: '=',
            rows: '=',
            rowsLoading: '=',
            rowsLoadingText: '@',
            gridPageSize: '=initialPagesize',
            gridSortColumn: '=initialSortcolumn',
            gridSortOrder: '=initialSortdesc',
            showRowNumbers: '=',
            showRowSelector: '=',
            gridHeightFixed: '=',
            gridHeightStretchBottomOffset: '=',
            gridFiltersChanged: '&',
            onDataImport: '&',
            onDataExport: '&'
        },
        templateUrl: '../Templates/NgNgridTemplate.html',
        link: link
    };
})


.filter('ngNgridPageOffset', function () {
    return function (input, start) {
        return input.slice(start);
    };
})
