/* 

TODO: format this later
    columnDefinitions: '=',
            childColumndefinitions: '=',
            childPropertyname: '@',
            rowFooterdefinitions: '=',
            rows: '=',
            rowsLoading: '=',                        
            rowsLoadingText: '@',                        
            bottomElementids: '=',
            gridSortColumn: '=initialSortcolumn',
            gridSortOrder: '=initialSortdesc',
            gridFilters: '='
            showRownumbers: '='
            gridHeight: '='


 Documentation for Column Definitions
                   
        PropertyName: 'Comments',
        DisplayName: 'Comments',
        Type: 'Button',                   

        DisableSort: true,
        SortProperty: 'length',

        DisableFilter: false,
        FilterClassFn: function (distinctItem) { return 'label-warning'; },
        FilterTextFn: function(r) {return "ASD";},   
        FilterGlyphFn: function (r) { return 'glyphicon-comment'; },
        FilterTooltipFn: function (r) { return 'Click to open/add comments'; },

        TextFn: function(r) {return "ASD";},   
        ClassFn: function (r) { return 'btn-default'; },
        GlyphFn: function (r) { return 'glyphicon-comment'; },
        TooltipFn: function (r) { return 'Click to open/add comments'; },
        BadgeFn : function(r) {return '1';}
        DisableFn: function(r) {return 'asd';},
        ClickFn: $scope.onCommentsClicked                   


        TODO: filter blanks?
        date range
        scroll rows only
                   
 */



angular.module('ngNgrid', [])
.directive('ngNgrid', function ($filter, $window) {

    function link(scope, element, attrs) {

        scope.pageSizeOptions = [10, 20, 50, 100, 500, 1000];
        scope.gridCurrentPage = 1;
        scope.gridPageSize = 50;        
        scope.gridChildrenSortOrder = false;
        scope.gridChildrenSortColumn = '';
        scope.customFilter = [];        
        scope.customFilter.ColumnFilters = [];        
        scope.filterSelectionList = [];     
        

        scope.setGridTableStyle = function () {            
            var topPosition = document.getElementById('ngGridToolbar').getBoundingClientRect().bottom;
            var bottomPosition = window.innerHeight - scope.gridHeight - document.getElementById('ngGridToolbar').getBoundingClientRect().top;            
            return { top: topPosition + 'px', bottom: bottomPosition + 'px' };            
        };


        scope.gridTotalPages = function () {
            return Math.ceil(scope.rows.length / scope.gridPageSize);
        }

        scope.canShowGroup = function () {
            return true;
        }       
        
        scope.changeSort = function (sortCol) {
            scope.gridSortOrder = !scope.gridSortOrder;
            scope.gridSortColumn = scope.getSortProperty(sortCol);
        }

        scope.isSorted = function (sortCol) {
            return (scope.gridSortColumn == scope.getSortProperty(sortCol));
        }

        scope.changeChildSort = function (sortCol) {
            scope.gridChildrenSortOrder = !scope.gridChildrenSortOrder;
            scope.gridChildrenSortColumn = scope.getSortProperty(sortCol);
        }

        scope.isGridChildSorted = function (sortCol) {
            return (scope.gridChildrenSortColumn == scope.getSortProperty(sortCol));
        }

        scope.getSortProperty = function (col) {
            var colName = null;
            if (col.OverrideSortProperty != null) {
                colName = col.Name + '.' + col.OverrideSortProperty;
            }
            else {
                colName = col.Name;
            }
            return colName;
        }
        
        scope.getColValue = function (col, row) {
            var val = null;
            if (row[col.Name] != null) {
                if (col.OverrideSortProperty != null) {
                    val = row[col.Name][col.OverrideSortProperty];
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
            for (i = 0, len = row[scope.childPropertyname].length ; i < len; i++) {
                var colValue = scope.getColValue(col, row[scope.childPropertyname][i]);
                if (colValue != null) {
                    if (distinctValues.indexOf(colValue) == -1) {
                        distinctValues.push(colValue);
                    }
                }
            }
            distinctValues.sort();
            return distinctValues;
        };

        scope.distinctColValues = function (col) {
            var distinctValues = [];
            var colName = scope.getSortProperty(col);
            for (i = 0, len = scope.rows.length ; i < len; i++) {
                var colValue = scope.getColValue(col, scope.rows[i]);
                if (colValue != null) {                    
                    if (distinctValues.indexOf(colValue) == -1) {                        
                        distinctValues.push(colValue);
                    }
                }
            }
            distinctValues.sort();
            return distinctValues;
        };

        scope.distinctColValuesFiltered = function (col) {

            var colName = scope.getSortProperty(col);
            var filteredList = [];
            var filteredRows = scope.gridFilteredRows; 

            if (filteredRows.length == scope.rows.length || (scope.customFilter.ColumnFilters[colName] != null && scope.customFilter.ColumnFilters[colName].IsFirstFilter)) {
                filteredList = scope.distinctColValues(col);
            }
            else if (scope.isColNameFilterApplied(colName)) {
                //Filtered applied to me-  and I am not the first filter
                //check to see if I have saved the list 
                filteredList = scope.filterSelectionList[colName];
            }
            else {
                //in these filtered rows find current col values
                for (var i = 0; i < filteredRows.length; i++) {
                    var temp = scope.getColValue(col, filteredRows[i]);

                    if (filteredList.indexOf(temp) <= -1) {
                        filteredList.push(temp);
                    }
                }
                scope.filterSelectionList[colName] = filteredList;
            }

            return filteredList;
        }

        scope.clearColFilters = function (colName) {            
            delete scope.customFilter.ColumnFilters[colName];
        }

        scope.toggleColFilters = function (col) {
            var colName = scope.getSortProperty(col);
            if (scope.isColNameFilterApplied(colName)) {
                //clear all filters
                scope.clearColFilters(colName);
            }
            else {
                //select all values which are filtered in drop down list                
                for (var i = 0; i < col.DropdownFilteredValues.length; i++) {
                    scope.addColumnFilter(col, col.DropdownFilteredValues[i], true);
                }
            }
        }

        scope.addColumnFilter = function (col, filterString, allowMultiple) {
            if (filterString != null) {
                var colName = scope.getSortProperty(col);
                filterString = filterString.toString().trim().toLowerCase();
                var firstFilter = false;
                if (Object.keys(scope.customFilter.ColumnFilters).length <= 0) {
                    firstFilter = true;
                }

                if (scope.customFilter.ColumnFilters[colName] == null) {
                    scope.customFilter.ColumnFilters[colName] = [];
                }
                if (allowMultiple) {
                    var posFilter = scope.customFilter.ColumnFilters[colName].indexOf(filterString);
                    if (posFilter == -1) {
                        logDebug('adding filter ' + filterString);
                        //item  not found - add it
                        scope.customFilter.ColumnFilters[colName].push(filterString);
                        //Is this column already the FirstFilter?
                        if (!scope.customFilter.ColumnFilters[colName].IsFirstFilter) {
                            scope.customFilter.ColumnFilters[colName].IsFirstFilter = firstFilter;
                        }
                    }
                    else {
                        logDebug('removing filter ' + filterString);
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
                    }
                }
                else {
                    scope.customFilter.ColumnFilters[colName] = [filterString];
                    if (filterString == '') {
                        scope.customFilter.ColumnFilters[colName].IsFirstFilter = false;
                    }
                    else {
                        scope.customFilter.ColumnFilters[colName].IsFirstFilter = firstFilter;
                    }
                    col.ColHeaderFilter = '';

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
        }

        scope.anyFiltersExist = function () {
            if (scope.customFilter.ColumnFilters == null || scope.customFilter.ColumnFilters == [] || Object.keys(scope.customFilter.ColumnFilters) <= 0) return false;

            for (var prop in scope.customFilter.ColumnFilters) {                
                if (scope.customFilter.ColumnFilters[prop] != null) return true;
            }
            return false;
        }

        scope.$watch('gridFilters', function (newVal, oldVal) {
            logDebug('gridFilters Changed');
            if (scope.gridFilters != null) {
                for (var i = 0; i < scope.gridFilters.length; i++) {
                    var gFilter = scope.gridFilters[i];
                    scope.addColumnFilter(gFilter.Column, gFilter.FilterString, true);
                }
            }            
        });

        scope.getStyle = function () {
            return { height: scope.gridHeight + 'px', width: 100 + '%' };
        }
    }   
    
    return {
        restrict: 'E',
        scope: {
            columnDefinitions: '=',
            childColumndefinitions: '=',
            childPropertyname: '@',
            rowFooterdefinitions: '=',
            rows: '=',
            rowsLoading: '=',
            rowsLoadingText: '@',
            bottomElementids: '=',
            gridSortColumn: '=initialSortcolumn',
            gridSortOrder: '=initialSortdesc',
            gridFilters: '=',
            showRownumbers: '=',
            gridHeight: '='
        },
        templateUrl: 'Templates/NgNgridTemplate.html',
        link: link
    };
})

.filter('ngNgridFilter', function ($filter) {
    return function (rows, customFilter) {
        
        var filteredRows = rows;
        if (customFilter != null && customFilter.ColumnFilters != null ) {
            if (Object.keys(customFilter.ColumnFilters).length > 0) {
                var tempFilteredRows = [];
                for (var i = 0; i < filteredRows.length; i++) {
                    var row = filteredRows[i];
                    var rowMatched = true;
                    for (var prop in customFilter.ColumnFilters) {
                        var filtersForCol = customFilter.ColumnFilters[prop];
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
                                break;
                            }
                        }
                        rowMatched = rowMatched && colMatched;
                    }
                    if (rowMatched) {
                        tempFilteredRows.push(row);
                    }
                }
                filteredRows = tempFilteredRows;
            }
        }
        return filteredRows;
    };
})

.filter('ngNgridPageOffset', function () {
    return function (input, start) {
        return input.slice(start);
    };
});
