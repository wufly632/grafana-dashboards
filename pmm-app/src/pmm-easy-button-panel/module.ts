/// <reference path="../../headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import config from 'app/core/config';
import jquery from "jquery";

export class PanelCtrl extends MetricsPanelCtrl {
    static template = `
<table>
    <tr>
    <td>
        <div style="margin-right: 5px;">
            <input style="background-color: black; width: 50px; height: 50px; border: solid 1px black; padding: 5px; font-size: 16pt" id="easy_input" name="easy_input" value="4">
        </div>
    </td>
    <td>
        <button style="background-color: black; width: 100px; height: 50px; border: solid 1px black" id="easy_btn">Scale cluster</button>
    </td>
    <td><div style="margin-left: 20px">{{ctrl.panel.text}}</div></td>
    </tr>
</table>
    `;

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);
        this.panel.text = "";
        this.panel.instances = 0;
    }

    link($scope, elem) {
        const btn = elem.find('#easy_btn');
        const inpt = elem.find('#easy_input');

        this.panel.instances = inpt[0].value;
        let panel = this.panel;
        let self = this;

        btn.on('click', () => {
            console.log("Cluster was scaled!");
            jquery.ajax({
                url: "/dbaas/v2/catalog",
            }).done(function( data ) {
                    if ( console && console.log ) {
                        console.log( "Sample of data:", data );
                    }
                });

            panel.text = "Scaling cluster to " + inpt[0].value + " instances!";
            self.$timeout(() => {}, 100); // Update panel
            self.$timeout(() => { panel.text = ""}, 2000); // Update panel
        });
    }
}
