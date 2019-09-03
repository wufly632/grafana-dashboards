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
            <input style="background-color: black; width: 50px; height: 50px; border: solid 1px black; padding: 5px; font-size: 16pt" id="easy_input" name="easy_input" value="{{ctrl.panel.instances}}">
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
        this.panel.instances = 3;
        this.panel.clusterName = "test-pxc-cluster";
    }

    link($scope, elem) {
        const btn = elem.find('#easy_btn');
        const input = elem.find('#easy_input');

        input.on('change', (e)=>{
            console.log(e);
            this.panel.instances = e.currentTarget.value;
        });

        btn.on('click', this.doScale.bind(this));
    }

    doScale() {

        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName})
            .then(this.updateCluster.bind(this))
            .catch(this.createCluster.bind(this));

        this.panel.text = "Scaling cluster to " + this.panel.instances + " instances!";
        this.$timeout(() => {}, 100); // Update panel
        this.$timeout(() => {  this.panel.text = ""}, 2000); // Update panel
    }

    updateCluster(data) {
        console.log("Updating cluster", data );

        let updateClusterRequest = {
            "service_id":"percona-xtradb-cluster-id",
            "plan_id":"percona-xtradb-id",
            "parameters":{
                "cluster_name": this.panel.clusterName,
                "replicas": this.panel.instances,
            }
        };

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            method: 'UPDATE',
            data: JSON.stringify(updateClusterRequest),
        }).then((data)=>{
            console.log("Cluster was created: ", data);
        })
    }

    createCluster(err) {
        console.log("Creating cluster", err );

        let createClusterRequest = {
            "service_id":"percona-xtradb-cluster-id",
            "plan_id":"percona-xtradb-id",
            "parameters":{
                "cluster_name": this.panel.clusterName,
                "replicas": this.panel.instances,
                "topology_key": "none",
                "proxy_sql_replicas": 0,
                "size": "512M"
            }
        };

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            method: 'PUT',
            data: JSON.stringify(createClusterRequest),
        }).then((data)=>{
            console.log("Cluster was created: ", data);
        })
    }
}
