/// <reference path="../../headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import config from 'app/core/config';
import jquery from "jquery";

export class PanelCtrl extends MetricsPanelCtrl {
    static templateUrl = 'pmm-easy-button-panel/partials/module.html';

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);
        this.panel.text = "";
        this.panel.instances = 3;
        this.panel.clusterName = "test-pxc";
        this.panel.pmmImage = "";
        this.panel.pmmHost = "monitoring-service:443";
    }

    link($scope, elem) {
        const btn = elem.find('#easy_btn');
        const input = elem.find('#easy_input');
        const settings = elem.find('#easy_settings');

        input.on('change', (e)=>{
            if(e.currentTarget.value > 5 || e.currentTarget.value < 0) {
                e.currentTarget.value = 3;
            }
            this.panel.instances = parseInt(e.currentTarget.value);
            this.refresh();
        });

        btn.on('click', this.doScale.bind(this));
        settings.on('dblclick', this.changeSettings.bind(this));
        this.updateClusterStatus();
    }

    doScale() {
        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName, dataType: "json"})
            .then(this.updateCluster.bind(this))
            .catch(this.createCluster.bind(this));
    }

    changeSettings() {
        this.panel.clusterName = prompt("Cluster Name", this.panel.clusterName) || this.panel.clusterName;
        this.panel.pmmImage = prompt("PMM Image", this.panel.pmmImage) || this.panel.pmmImage;
        this.panel.pmmHost = prompt("PMM Host", this.panel.pmmHost) || this.panel.pmmHost;
        this.refresh();
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
                "replicas": instancesCount,
                "pmm_enabled": true,
                "pmm_image": this.panel.pmmImage,
                "pmm_host": this.panel.pmmHost,
                "pmm_user": "admin",
                "pmm_pass": "admin",
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
            this.refresh();
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
                "size": "512M",
                "pmm_enabled": true,
                "pmm_image": this.panel.pmmImage,
                "pmm_host": this.panel.pmmHost,
                "pmm_user": "admin",
                "pmm_pass": "admin",
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
            this.refresh();
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
            this.panel.text = "Status: deleted";
            this.refresh();
        }).catch((err)=>{
            console.log("Cluster was not deleted: ", err);
        })
    }

    updateClusterStatus() {
        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName, dataType: "json"})
            .then(this.refreshStatus.bind(this))
            .catch(this.resetStatus.bind(this));
        this.$timeout(this.updateClusterStatus.bind(this), 10000);
    }

    refreshStatus(data) {
        console.log(data);
        this.panel.text = "Status: " + data.last_operation.state;
        this.refresh();
    }

    resetStatus(err) {
        console.log(err);
        this.panel.text = "";
        this.refresh();
    }
}
