/// <reference path="../../headers/common.d.ts" />

import {MetricsPanelCtrl} from 'app/plugins/sdk';
import jquery from "jquery";
import lodash from 'lodash';

export class PanelCtrl extends MetricsPanelCtrl {
    static templateUrl = 'pmm-easy-button-panel/partials/module.html';

    panelDefaults = {
        title: "Cluster: 'my-cluster'",
        instances: 3,
        loading: false,
        action: "Scale",
        actionClass: "btn-primary",
        status: "Status: not ready",
        clusterName: "my-cluster",
        operatorImage: "perconalab/percona-xtradb-cluster-operator:PR-237-4a16d07",
        pmmImage: "perconalab/pmm-client-fb:PR-410-4389212",
        pmmHost: "monitoring-service:443",
    };

    /** @ngInject */
    constructor($scope, $injector) {
        super($scope, $injector);
        lodash.defaultsDeep(this.panel, this.panelDefaults);
    }

    link($scope, elem) {
        const btn = elem.find('#easy_btn');
        const input = elem.find('#easy_input');
        const settings = elem.find('#easy_settings');

        input.on('change', (e) => {
            if (e.currentTarget.value > 5 || e.currentTarget.value < 0) {
                e.currentTarget.value = 3;
            }
            this.panel.instances = parseInt(e.currentTarget.value);

            this.panel.action = this.panelDefaults.action;
            this.panel.actionClass = this.panelDefaults.actionClass;
            if (this.panel.instances === 0) {
                this.panel.action = "Remove";
                this.panel.actionClass = "btn-danger";
            }

            this.refresh();
        });

        btn.on('click', this.doScale.bind(this));
        settings.on('click', this.changeSettings.bind(this));
        this.events.on('render', this.onRender.bind(this));
        setInterval(() => {
            this.updateClusterStatus()
        }, 10000);
    }

    onRender() {
        // Tells the screen capture system that you finished
        this.renderingCompleted();
    }

    doScale() {
        this.refreshStatus({last_operation: {state: "in progress"}});
        jquery.ajax({url: "/dbaas/v2/service_instances/" + this.panel.clusterName, dataType: "json"})
            .then(this.updateCluster.bind(this))
            .catch(this.createCluster.bind(this));
    }

    changeSettings() {
        this.panel.clusterName = prompt("Cluster Name", this.panel.clusterName) || this.panel.clusterName;
        this.panel.title = "Cluster: '" + this.panel.clusterName + "'";
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

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'UPDATE',
            dataType: "json",
            data: JSON.stringify(req),
        })
            .then((data) => {
                console.log("Cluster was updated: ", data);
                this.panel.status = "Status: " + data.last_operation.state;
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
                "size": "512M",
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

        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'PUT',
            dataType: "json",
            data: JSON.stringify(req),
        })
            .then((data) => {
                console.log("Cluster was created: ", data);
                this.panel.status = "Status: " + data.last_operation.state;
                this.refresh();
            })
            .then(this.updateClusterStatus.bind(this))
            .catch((err) => {
                console.log("Cluster was not created: ", err);
            })
    }

    deleteCluster(data) {
        jquery.ajax({
            url: "/dbaas/v2/service_instances/" + this.panel.clusterName,
            contentType: "application/json",
            method: 'DELETE',
            dataType: "json"
        })
            .then((data) => {
                console.log("Cluster was deleted: ", data);
                this.panel.status = "Status: deleted";
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

    refreshStatus(data) {
        console.log(data);
        this.panel.status = "Status: " + data.last_operation.state;
        this.panel.loading = data.last_operation.state === "in progress";
        this.refresh();
    }

    resetStatus(err) {
        this.panel.loading = false;
        this.panel.status = "Status: " + err.status + " ( " + err.statusText + " )";

        if (err.status === 404) {
            this.panel.status = "Status: not exists";
        }

        this.refresh();
    }
}
