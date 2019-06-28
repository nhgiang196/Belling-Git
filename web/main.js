/**
 * bootstrap script of the tasklist application
 */
(function (document, window, require) {
    require({
        paths: {
            'jquery': 'vendor/jquery/jquery.min',
            'angular-file-upload-shim': 'vendor/angular-file-upload/angular-file-upload-shim',
            'angular': 'vendor/angular/angular.min',
            'angularAMD': 'vendor/angular/angularAMD.min',
            'angular-route': 'vendor/angular/angular-route.min',
            'angular-resource': 'vendor/angular/angular-resource.min',
            'angular-sanitize': 'vendor/angular/angular-sanitize.min',
            'angular-cookies': 'vendor/angular/angular-cookies.min',
            'angular-file-upload': 'vendor/angular-file-upload/angular-file-upload',
            'bpmn': 'vendor/cabpmn/Bpmn',
            'Transformer': 'vendor/cabpmn/Transformer',
            'Renderer': 'vendor/cabpmn/Renderer',
            'bootstrap': 'vendor/bootstrap/js/bootstrap.min',
            'taffydb': 'vendor/taffydb/taffy-min',
            'angular-filter': 'vendor/angular-filter/angular-filter.min',
            'higthchart': 'vendor/hightchart/js/highcharts',
            'higthchartexport': 'vendor/hightchart/js/modules/exporting',
            'angular-translate': 'vendor/angular/angular-translate.min',
            'angular-translate-loader-static-files': 'vendor/angular/angular-translate-loader-static-files.min',
            'angular-translate-loader-partial': 'vendor/angular/angular-translate-loader-partial.min',
            'moment': 'vendor/moment',
            'uiselect2': 'vendor/angular-ui-select2/src/select2',
            'select2': 'vendor/select2/select2',
            'ui-grid': 'vendor/ui-grid/ui-grid',
            'xlsxfull': 'vendor/ui-grid/xlsx.core.min',
            'xlsxexport': 'vendor/js-xlsx/dist/xlsx.full.min',
            'datetimepicker': 'vendor/datetimepicker/jquery.datetimepicker',
            'io-barcode': 'vendor/angular-io-barcode-master/build/angular-io-barcode',
            'angular-pivottable': 'vendor/angular-pivot/angular-pivot',
            'pivottable': 'vendor/pivottable/pivot',
            'datatables.net': 'vendor/datatables/jquery.dataTables.min',
            'datatables.net-buttons': 'vendor/datatables/dataTables.buttons.min',
            'datatables.net-bs': 'vendor/datatables/buttons.bootstrap.min',
            'datatables.net-print': 'vendor/datatables/buttons.print.min',
            'button.html5': 'vendor/datatables/buttons.html5.min',
            'pdfmake': 'vendor/datatables/pdfmake.min',
            'vfs-fonts': 'vendor/datatables/vfs_fonts',
            'jszip': 'vendor/datatables/jszip.min',
            'buttons.flash': 'vendor/datatables/buttons.flash.min',
            'dataTables.bootstrap': 'vendor/datatables/dataTables.bootstrap.min',
            'dataTables.rowGroup': 'https://cdn.datatables.net/rowgroup/1.0.4/js/dataTables.rowGroup.min',
            'socketio': 'vendor/socket.io/socket.io'
        },
        //加载非规范的模块
        shim: {
            'angular': { deps: ['jquery'], exports: 'angular' },
            'angular-route': { deps: ['angular'] },
            'angular-resource': { deps: ['angular'] },
            'angular-sanitize': { deps: ['angular'] },
            'angular-cookies': { deps: ['angular'] },
            'angularAMD': ['angular'],
            'ngload': ['angularAMD'],
            'angular-file-upload': { deps: ['angular', ''] },
            'angular-filter': { deps: ['angular'] },
            'bpmn': { deps: ['angular', 'jquery'] },
            'bootstrap': { deps: ['jquery'] },
            'higthchart': { deps: ['jquery'] },
            'higthchartexport': { deps: ['jquery', 'higthchart'] },
            'uiselect2': { deps: ['angular', 'jquery'] },
            'select2': { deps: ['jquery'] },
            'ui-grid': { deps: ['angular'] },
            'datetimepicker': { deps: ['jquery'] },
            'angular-translate': { deps: ['jquery', 'angular'] },
            'angular-translate-loader-static-files': { deps: ['jquery', 'angular', 'angular-translate'] },
            'angular-translate-loader-partial': { deps: ['jquery', 'angular', 'angular-translate'] },
            'io-barcode': { deps: ['angular', 'jquery'] },
            'xlsxfull': { deps: ['jquery'] },
            'xlsxexport': { deps: ['jquery'] },
            'angular-pivottable': { deps: ['angular'] },
            'pivottable': { deps: ['jquery'] },
            'datatables.net': { deps: ['jquery'] },
            'datatables.net-buttons': { deps: ['jquery'] },
            'datatables.net-bs': { deps: ['jquery'] },
            'datatables.net-print': { deps: ['jquery'] },
            'button.html5': { deps: ['jquery'] },
            'pdfmake': { deps: ['jquery'] },
            'vfs-fonts': { deps: ['jquery'] },
            'jszip': { deps: ['jquery'] },
            'buttons.flash': { deps: ['jquery'] },
            'dataTables.bootstrap': { deps: ['jquery'] },
            'dataTables.rowGroup': { deps: ['jquery'] },
            'socketio': { deps: ['angular', 'jquery'] }

        },
        waitSeconds: 0,
        deps: ['myapp'],
        packages: [
            { name: 'dojo', location: 'vendor/dojo/dojo' },
            { name: 'dojox', location: 'vendor/dojo/dojox' }]
    });

    //  require(['jquery_validation_cn','jquery_validation'], function() {
    //  });

    //app myapp 为js 的路径
    require(['angular-file-upload-shim', 'bpmn', 'angular', 'taffydb', 'uiselect2', 'select2', 'angular-resource',
        'angular-file-upload', 'bootstrap', 'angular-filter', 'higthchart', 'higthchartexport', 'moment', 'ui-grid', 'datetimepicker',
        'angular-translate', 'angular-translate-loader-static-files', 'angular-translate-loader-partial', 'angularAMD', 'io-barcode',
        'xlsxfull', 'xlsxexport', 'myapp', 'datatables.net', 'datatables.net-bs', 'datatables.net-buttons',
        'datatables.net-print', 'button.html5', 'pdfmake', 'vfs-fonts', 'jszip', 'buttons.flash', 'dataTables.bootstrap', 'dataTables.rowGroup'
        ,'socketio',
    ], function (uploadshim, bpmn, angular, taffydb) {
        console.log("bootstrap");
        // angular.bootstrap(document, ["tasklist"]);//ng-app
    });

})(document, window || this, require);