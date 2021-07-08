const util = require('util');
const request = util.promisify(require('request'));
// const URLSearchParams = require('@ungap/url-search-params');
const HttpsProxyAgent = require('https-proxy-agent');


let appDebug = true;

class LordsApi {
    constructor(id, auth_url, debug = true, proxy) {
        this.id = id;
        this.auth_url = auth_url;
        this.proxy = proxy;
        appDebug = debug;
    }
    
    async getWorkerPrice(id) {
        let response = await this.sendRequest("f.php", { worker: id });
        // debug("Get info worker: " + id + "...");
        return response;
    }

    async buyWorker(id) {
        let response = await this.sendRequest("f.php", { worker: id, confirm: 1 });
        debug(response.desc || "");
        return response;
    }

    async buyResource({ price, resource, user, amount }) {
        let response = await this.sendRequest("y.php", { price, resource, user, amount });
        // debug(`[${this.id}] Buy resource price:${price}, resource:${resource}, user:${user}, amount:${amount}`, response.desc || "");
        debug(`[${this.id}] Buy resource price:${price}, resource:${resource}, user:${user}, amount:${amount}`, response.desc || "");
        return response;
    }

    async setResourcesOffer({ resource, price, reserve }) {
        let response = await this.sendRequest("x.php", { resource, price, reserve });
        debug(`[${this.id}] Set resource offer resource:${resource}, price:${price}, reserve:${reserve}`, response.desc || "");
        // debug(response.desc || "");
        if (response.error){
            console.log(response)
        }
        return response;
    }

    async deleteResourcesOffer() {
        let response = await this.sendRequest("x.php", { delete: 1 });
        debug(`[${this.id}] Delete resource offer resource`, response, response.desc || "");
        return response;
    }

    async getUpgradeCompanyInfo() {
        let response = await this.sendRequest("w.php", {});
        debug("Get company upgrade info: ...", response.desc || "");
        return response;
    }

    async upgradeCompany() {
        let response = await this.sendRequest("w.php", { confirm: 1 });
        debug("Upgrade company: ", response.desc || "");
        return response;
    }

    async setCompanyType(resource) {
        let response = await this.sendRequest("j.php", { resource });
        debug("setCompanyType: ", response.desc || "");
        return response;
    }

    async setCompanyName(name) {
        let response = await this.sendRequest("n.php", { confirm: 1, name });
        debug("setCompanyName: ", response.desc || "");
        return response;
    }

    async healWorker(worker_id, mode = 0) {
        let response = await this.sendRequest("s.php", { confirm: 1, worker: worker_id, mode });
        debug("healWorker: ", response.desc || "");
        return response;
    }


    async getHealWorkerInfo(worker_id) {
        let response = await this.sendRequest("s.php", { worker: worker_id });
        debug("getHealWorkerInfo: ", response.desc || "");
        return response;
    }

    async immuneWorker(worker_id, mode) {
        let response = await this.sendRequest("h.php", { confirm: 1, worker: worker_id, mode });
        debug("immuneWorker: ", response.desc || "");
        return response;
    }


    async getImmuneWorkerInfo(worker_id) {
        let response = await this.sendRequest("h.php", { worker: worker_id });
        debug("getImmuneWorkerInfo: ", response.desc || "");
        return response;
    }


    async upgradeWorker(worker_id) {
        let response = await this.sendRequest("u.php", { confirm: 1, worker: worker_id });
        debug("upgradeWorker: ", response.desc || "");
        return response;
    }

    async getUpgradeWorkerInfo(worker_id) {
        let response = await this.sendRequest("u.php", { worker: worker_id });
        debug("getUpgradeWorkerInfo: ", response.desc || "");
        return response;
    }

    async getShowAd(worker_id) {
        let response = await this.sendRequest("ad374589/ads_view.php", { });
        debug("getShowAd: ", response.desc || "");
        return response;
    }
    
    async showAd(worker_id) {
        let response = await this.sendRequest("ad374589/ads_view.php", { confirm: 1});
        debug("showAd: ", response.desc || "");
        return response;
    }
    

    setProxy(proxy){
        this.proxy = proxy;
    }
    
    async sendRequest(url, data = {}, type = 'POST') {
        try {
            let dataString = new URLSearchParams();
            // dataString.append('uid', this.id);
            // dataString.append('token', this.auth_key);

            for (const [key, value] of Object.entries(data)) {
                // console.log(key, value)
                dataString.append(key, value);
            }
            const proxyAgent = new HttpsProxyAgent(`http://${this.proxy}`);

            let req = await request({
                ...this.proxy ? { agent: proxyAgent} : {},
                url: 'https://lords-game.cc/exec/' + url,
                method: type,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'referer': this.auth_url,
                },
                body: dataString.toString(),
            });

            // console.log(req.body);
            if (!req.body.toString().startsWith("{")){
                console.log({errdata: req.body})
                return false;
            }
            return JSON.parse(req.body);
        } catch (e) {
            // console.error(e.message);
            return false;
        }
    }

}

function debug(...o) {
    if (appDebug == true) {
        for (let val of o) {
            console.log(val);
        }
    }
}

module.exports = LordsApi;