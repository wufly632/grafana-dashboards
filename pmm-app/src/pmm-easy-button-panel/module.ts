/// <reference path="../../headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import config from 'app/core/config';
import jquery from "jquery";

export class PanelCtrl extends MetricsPanelCtrl {
    static template = `
<table>
    <tr>
    <td><button style="background-color: black; width: 100px; height: 50px; border: solid 1px black" id="easy_btn">Scale clutster</button></td>
    <td><div style="margin-left: 20px">{{ctrl.panel.text}}</div></td>
    </tr>
</table>
    `;

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);
        this.panel.text = "";
        this.panel.times = 0;
    }

    link($scope, elem) {
        const btn = elem.find('#easy_btn');
        let panel = this.panel;
        let self = this;

        console.log(btn);

        btn.on('click', () => {
            console.log("Cluster was scaled!");
            jquery.ajax({
                url: "/dbaas/v2/catalog",
            }).done(function( data ) {
                    if ( console && console.log ) {
                        console.log( "Sample of data:", data );
                    }
                });

            panel.times += 1;
            panel.text = "Cluster was scaled! " + panel.times;
            self.$timeout(() => {}, 100); // Update panel
        });
    }
}
