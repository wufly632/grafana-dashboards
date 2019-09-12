/// <reference path="../../headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import jquery from "jquery";
import lodash from 'lodash';

export class PanelCtrl extends MetricsPanelCtrl {
    static templateUrl = 'pmm-easy-button-panel/partials/module.html';

    panelDefaults = {
        title: "Scale cluster",
        instances: 3,
        loading: false,
        action: "Scale",
        actionClass: "btn-primary",
        status: "Scale",
        clusterName: "my-cluster",
        operatorImage: "perconalab/percona-xtradb-cluster-operator:PR-237-2d1eb9d",
        pmmImage: "perconalab/pmm-client-fb:PR-410-135bd4b",
        pmmHost: "monitoring-service:443",
    };

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);
        lodash.defaultsDeep(this.panel, this.panelDefaults);
    }

    link($scope, elem) {
        const btn = elem.find('#easy_btn');
        const settings = elem.find('#easy_settings');

        btn.on('click', this.doScale.bind(this));
        settings.on('click', this.changeSettings.bind(this));
        this.events.on('render', this.onRender.bind(this));
        setInterval(() => {
            this.updateClusterStatus()
        }, 5000);
    }

    onRender() {
        // Tells the screen capture system that you finished
        this.renderingCompleted();
    }

    doScale() {
        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName, dataType: "json"})
            .then(this.updateCluster.bind(this))
            .catch(this.createCluster.bind(this));
    }

    changeSettings() {
        this.panel.instances = prompt("Instances", this.panel.instances) || this.panel.instances;
        this.panel.clusterName = prompt("Cluster Name", this.panel.clusterName) || this.panel.clusterName;
        this.panel.title = "Scale the cluster";
        this.panel.pmmHost = prompt("PMM Server Host", this.panel.pmmHost) || this.panel.pmmHost;
        this.panel.pmmImage = prompt("PMM Client Docker Image", this.panel.pmmImage) || this.panel.pmmImage;
        this.panel.operatorImage = prompt("Operator Docker Image", this.panel.operatorImage) || this.panel.operatorImage;
        this.refresh();
    }

    updateCluster(data) {
        let instancesCount = parseInt(this.panel.instances);
        if (instancesCount == 0) {
            this.deleteCluster(data);
            return;
        }

        let req = {
            "service_id": "percona-xtradb-cluster-id",
            "plan_id": "percona-xtradb-id",
            "parameters": {
                "cluster_name": this.panel.clusterName,
                "replicas": instancesCount,
                "operator_image": this.panel.operatorImage,
                "pmm_enabled": true,
                "pmm_image": this.panel.pmmImage,
                "pmm_host": this.panel.pmmHost,
                "pmm_user": "admin",
                "pmm_pass": "admin",
            }
        };

        console.log("Updating cluster...");
        console.log("Request: ", req);

        this.updateButtonStatus();

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'UPDATE',
            dataType: "json",
            data: JSON.stringify(req),
        })
            .then((data) => {
                console.log("Cluster was updated: ", data);
                this.refresh();
            })
            .then(this.updateClusterStatus.bind(this))
            .catch((err) => {
                console.log("Cluster was not updated: ", err);
            })
    }

    createCluster(err) {
        let req = {
            "service_id": "percona-xtradb-cluster-id",
            "plan_id": "percona-xtradb-id",
            "parameters": {
                "cluster_name": this.panel.clusterName,
                "replicas": parseInt(this.panel.instances),
                "topology_key": "none",
                "proxy_sql_replicas": 0,
                "operator_image": this.panel.operatorImage,
                "pmm_enabled": true,
                "pmm_image": this.panel.pmmImage,
                "pmm_host": this.panel.pmmHost,
                "pmm_user": "admin",
                "pmm_pass": "admin",
            }
        };

        console.log("Creating cluster...");
        console.log("Request: ", req);

        this.updateButtonStatus();

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'PUT',
            dataType: "json",
            data: JSON.stringify(req),
        })
            .then((data) => {
                console.log("Cluster was created: ", data);
                this.refresh();
            })
            .then(this.updateClusterStatus.bind(this))
            .catch((err) => {
                console.log("Cluster was not created: ", err);
            })
    }

    deleteCluster(data) {

        this.updateButtonStatus();

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'DELETE',
            dataType: "json"
        })
            .then((data) => {
                console.log("Cluster was deleted: ", data);
                this.refresh();
            })
            .then(this.updateClusterStatus.bind(this))
            .catch((err) => {
                console.log("Cluster was not deleted: ", err);
            })
    }

    updateClusterStatus() {
        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName, dataType: "json"})
            .then(this.refreshStatus.bind(this))
            .catch(this.resetStatus.bind(this));
    }

    updateButtonStatus() {
        this.panel.action = "in progress";
        this.panel.loading = true;
        this.refresh();

        this.$timeout(()=>{
            this.panel.action = "Scale";
            this.panel.loading = false;
            this.refresh();
        }, 120000)
    }

    refreshStatus(data) {
        console.log(data);
    }

    resetStatus(err) {
        console.log(err);
    }
}
