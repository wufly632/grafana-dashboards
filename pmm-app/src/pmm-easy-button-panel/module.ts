/// <reference path="../../headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import config from 'app/core/config';
import jquery from "jquery";

export class PanelCtrl extends MetricsPanelCtrl {
    static template = `
<table>
    <tr>
        <td>
            <button style="background-color: black; width: 100px; height: 50px; border: solid 1px black" id="easy_btn">Scale cluster</button>
        </td>
        <td>
            <div style="margin-left: 5px;">
                <input 
                style="background-color: black; width: 50px; height: 50px; border: solid 1px black; padding: 5px; font-size: 16pt" 
                id="easy_input" 
                name="easy_input" 
                value="{{ctrl.panel.instances}}" >
            </div>
        </td>
        <td>
            <div style="margin-left: 20px; font-size: 16pt">{{ctrl.panel.text}}</div>
        </td>
    </tr>
</table>
    `;

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);
        this.panel.text = "";
        this.panel.instances = 3;
        this.panel.clusterName = "test-pxc";
    }

    link($scope, elem) {
        const btn = elem.find('#easy_btn');
        const input = elem.find('#easy_input');

        input.on('change', (e)=>{
            if(e.currentTarget.value > 5 || e.currentTarget.value < 0) {
                e.currentTarget.value = 3;
            }
            this.panel.instances = parseInt(e.currentTarget.value);
        });

        btn.on('click', this.doScale.bind(this));
        this.updateClusterStatus();
    }

    updateClusterStatus() {
        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName, dataType: "json"})
           .then((data)=>{
               this.panel.text = "Status: " + data.last_operation.state;
               this.$timeout(() => {}, 100); // Update panel.
           })
           .catch((err)=>{
               console.log(err); this.panel.text = "";
               this.$timeout(() => {}, 100); // Update panel.
           });

        this.$timeout(this.updateClusterStatus.bind(this), 10000);
    }

    doScale() {
        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName, dataType: "json"})
            .then(this.updateCluster.bind(this))
            .catch(this.createCluster.bind(this));
    }

    updateCluster(data) {
        console.log("Updating cluster", data );

        let instancesCount = parseInt(this.panel.instances);
        if (instancesCount == 0) {
            this.deleteCluster(data);
            return;
        }

        let updateClusterRequest = {
            "service_id":"percona-xtradb-cluster-id",
            "plan_id":"percona-xtradb-id",
            "parameters":{
                "cluster_name": this.panel.clusterName,
                "replicas": instancesCount
            }
        };

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'UPDATE',
            dataType: "json",
            data: JSON.stringify(updateClusterRequest),
        }).then((data)=>{
            console.log("Cluster was updated: ", data);
            this.panel.text = "Status: " + data.last_operation.state;
            this.$timeout(() => {}, 100); // Update panel.
        }).catch((err)=>{
            console.log("Cluster was not updated: ", err);
        })
    }

    createCluster(err) {
        console.log("Creating cluster", err );

        let createClusterRequest = {
            "service_id":"percona-xtradb-cluster-id",
            "plan_id":"percona-xtradb-id",
            "parameters":{
                "cluster_name": this.panel.clusterName,
                "replicas": parseInt(this.panel.instances),
                "topology_key": "none",
                "proxy_sql_replicas": 0,
                "size": "512M"
            }
        };

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'PUT',
            dataType: "json",
            data: JSON.stringify(createClusterRequest),
        }).then((data)=>{
            console.log("Cluster was created: ", data);
            this.panel.text = "Status: " + data.last_operation.state;
            this.$timeout(() => {}, 100); // Update panel.
        }).catch((err)=>{
            console.log("Cluster was not created: ", err);
        })
    }

    deleteCluster(data) {
        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'DELETE',
            dataType: "json"
        }).then((data)=>{
            console.log("Cluster was deleted: ", data);
            this.panel.text = "Status: Deleted";
            this.$timeout(() => {}, 100); // Update panel.
        }).catch((err)=>{
            console.log("Cluster was not deleted: ", err);
        })
    }
}
