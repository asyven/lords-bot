// const WS = require("./lib/ws-core");
const { getGroupsUsers } = require("./lib/helpers");

const LordsApi = require('./lib/api');
const WebSocket = require('ws');
const Chance = require('chance');
const util = require('util');
const fs = require('fs');
const rq = require('request');
const request = util.promisify(rq);
const sleep = util.promisify(setTimeout);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
let accounts = require("./accounts");


accounts = accounts.map(acc => {
    return { ...acc, api: new LordsApi(acc.id, acc.url) }
});

let resourceKeepers = accounts.filter(a => a.resourceKeeper);

let stocks = {
    [0]: {},
    [1]: {},
    [2]: {},
    [3]: {},
    [4]: {},
};

let canBuyUsers = [];
const SOCKET_URL = "wss://socket.lords-game.cc/wss/";
let chance = new Chance();


(async () => {
    canBuyUsers = JSON.parse(await readFile("groupIds.json"));
    canBuyUsers = [...canBuyUsers, accounts.map(u => u.id)];
    // let hash_links = JSON.parse(await readFile("hash_links.json"));
    // canBuyUsers = await getGroupsUsers(["vklords"], settings.VK_TOKEN);
    // console.log(`В базе ${canBuyUsers.length} игроков для покупки`);

    let resourceKeeperProxies = await readFile("proxy.txt");
    resourceKeeperProxies = String(resourceKeeperProxies).split(/\r?\n/);
    resourceKeeperProxies.pop();
    resourceKeeperProxies = chance.shuffle(resourceKeeperProxies);

    accounts.map(async (a, i) => {
        let proxy = resourceKeeperProxies[i];
        console.log(proxy)
        a.api.setProxy(proxy);

        // await a.api.deleteResourcesOffer()
    });

    for (let [i, account] of Object.entries(accounts)) {
        await sleep(100);
        //    
        // }
        // accounts.map(async (account, i) => {
        console.log(`[${i + 1}/${accounts.length}][${accounts[i].id}] Добавлен в работу.`)

        let ws = new WebSocket(SOCKET_URL);

        accounts[i].ws = ws;

        ws.onerror = (e) => {
            console.log("===== WSsocket", e)
        };
        ws.onopen = () => {
            // console.log(`[${accounts[i].id}] Подключился к сокету.`);

            // let myref = chance.pickone(hash_links);

            ws.send(JSON.stringify({ type: "init", url: account.url }));


            setInterval(() => {
                let check = accounts[i].check;
                if (check) {
                    ws.send(JSON.stringify({ user: account.id, check, type: "home" }));
                    if (accounts[i].home) {
                        let { user, res_type } = accounts[i].home;
                        ws.send(JSON.stringify({ user, check, type: "stocks", resource: res_type }));
                    }
                }
            }, 3000)

            setInterval(() => {
                let check = accounts[i].check;
                if (check) {
                    ws.send(JSON.stringify({
                        user: account.id, check, type: "info",
                        for_id: chance.pickone(canBuyUsers),
                    }));
                }
            }, chance.integer({ min: 2000, max: 7000 }));
        };

        ws.onclose = (e) => {
            // console.log(`[${accounts[i].id}] Отключился от сокета.`, e)
        };

        ws.onmessage = async (e) => {
            if (!e.data.toString().startsWith("{")) {
                console.log({ errdata: e })
                return;
            }
            let data = JSON.parse(e.data);
            if (!data.type) return;

            switch (data.type) {
                case "connect":
                    accounts[i].check = data.check;
                    // console.log(`[${accounts[i].id}] Авторизировался в игре.`)

                    // await accounts[i].api.setCompanyName(" ᠌");
                    break;
                case "home":
                    accounts[i].home = data;
                    accounts[i].resources = {
                        [0]: data.meal,
                        [1]: data.aid,
                        [2]: data.brick,
                        [3]: data.uni,
                        [4]: data.net,
                    };

                    if (data.res_type == 5) {
                        await accounts[i].api.setCompanyType(chance.pickone([0, 0, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4]))
                    }


                    break;
                case "stocks":
                    accounts[i].my_offer = data.my_offer || null;
                    stocks[data.resource] = data.stock;
                    break;
                case "user_info":
                    if (data.workers && Array.isArray(data.workers)) {
                        let users = data.workers.map(([user]) => Number(user));
                        // console.log({users})

                        let ll = canBuyUsers.length;
                        canBuyUsers = [...new Set([...canBuyUsers, ...users])]

                        if (canBuyUsers.length != ll) {
                            writeFile("groupIds.json", JSON.stringify(canBuyUsers));
                        }
                    }
                    break;
            }
        };
        // });
    }

    let setOfferLoop = async () => {
        // console.log("Выставляем офферы на продажу....")
        let offers = [];
        for (let { api, home, resources, my_offer, resourceKeeper } of accounts) {
            // if (resources && home && resourceKeeper) {
            if (resources && home) {
                let resource = home.res_type;

                let inOffers = (my_offer || {}).reserve || 0;
                let MAX = 10000;

                offers.push(api.setResourcesOffer({
                    resource: 0,
                    price: 1,
                    reserve: Math.min(Math.max(resources[0], MAX))
                }))
                await sleep(50);
                offers.push(api.setResourcesOffer({
                    resource: 1,
                    price: 1,
                    reserve: Math.min(Math.max(resources[1], MAX))
                }))
                await sleep(50);
                offers.push(api.setResourcesOffer({
                    resource: 2,
                    price: 1,
                    reserve: Math.min(Math.max(resources[2], MAX))
                }))
                await sleep(50);
                offers.push(api.setResourcesOffer({
                    resource: 3,
                    price: 1,
                    reserve: Math.min(Math.max(resources[3], MAX))
                }))
                await sleep(50);
                offers.push(api.setResourcesOffer({
                    resource: 4,
                    price: 1,
                    reserve: Math.min(Math.max(resources[4], MAX))
                }))
                // offers.push(api.setResourcesOffer({
                //     resource,
                //     price: 1,
                //     reserve: Math.min(Math.max(resources[resource], inOffers), 20000),
                // }));

                // offers.push(api.deleteResourcesOffer())
                await sleep(1000);

            }

        }
        // await Promise.all(offers);

        if (offers.length === 0) {
            await sleep(1000);
        }
        await sleep(300000);
        await setOfferLoop();
    };

    // setOfferLoop();


    let offersForUpMoney = async () => {
        // console.log("Выставляем офферы на продажу....")

        let offers = [];
        for (let { api, home, resources, my_offer } of resourceKeepers) {
            if (resources && home) {
                let resource = home.res_type;

                let inOffers = (my_offer || {}).reserve || 0;
                offers.push(api.setResourcesOffer({
                    resource,
                    price: 1,
                    reserve: 10000,
                }))
                // offers.push(api.deleteResourcesOffer())

                await sleep(1000);

            }

        }

        await Promise.all(offers);

        if (offers.length != 5) {
            await sleep(1000);
            await offersForUpMoney();
        }
    };

    // offersForUpMoney();


    let buySelledOffers = async () => {
        // console.log("Выставляем офферы на продажу....")
        let offers = [];
        for (let { api, home, resources, my_offer, resourceKeeper } of accounts) {
            if (resources && home && !resourceKeeper) {

                let seller = chance.pickone(resourceKeepers);

                if (!seller || !seller.home) {
                    return;
                }

                let buyResResponse = await api.buyResource({
                    price: 0.001,
                    resource: seller.home.res_type,
                    user: seller.id,
                    amount: Math.floor(home.balance / 0.1) / 2,
                });
            }

        }
        await Promise.all(offers);

        if (offers.length === 0) {
            await sleep(5000);
        }
        await buySelledOffers();
    };

    // buySelledOffers();

    let buyStockOffers = async () => {
        console.log("buyStockOffers....")
        let offers = [];
        for (let { api, home, resources, my_offer, resourceKeeper } of accounts) {
            if (resources && home) {

                let RES_TYPE = 0;
                let stock = stocks[RES_TYPE];
                // console.log(stock)

                if (!stock || !stock[0]) {
                    continue;
                }
                let order = stock[0];

                if (order.price == "0.001") {
                     offers.push(api.buyResource({
                        price: 0.001,
                        resource: RES_TYPE,
                        user: order.user,
                        amount: Math.floor(home.balance / 0.1) / 2,
                    }))
                }
            }

        }
        // await Promise.all(offers);

        if (offers.length === 0) {
            await sleep(1000);
        } else {
            await sleep(10000);
        }

        await buyStockOffers();
    };

    // buyStockOffers();


    let tryToBuySomeone = async () => {
        // console.log("Пытаемся купить игроков....")

        let isLoaded = (resourceKeepers.filter(rc => rc.home)).length === 5;
        let promises = [];

        let ourWorkers = getOurWorkers();
        let canBuy = canBuyUsers.filter(u => !ourWorkers.includes(u))

        if (isLoaded) {
            promises = accounts.map(async ({ api, home, resources }, i) => {
                await sleep(15);

                return new Promise(async (resolve, reject) => {
                    if (!home) {
                        resolve();
                        return;
                    }

                    // let user = chance.pickone(canBuy.filter(u => {
                    //     let workers = accounts.filter(a => a.resourceKeeper).map((rc) => {
                    //         return (rc.home.workers || []).map(w => w[0]);
                    //     });
                    //     let w = workers.flat()
                    //
                    //     return !w.includes(u);
                    // }));

                    let user = chance.pickone(canBuy);

                    let response = await api.getWorkerPrice(user);

                    let moneyNeed = (response.coin + response.meal) / 1000;
                    // console.log({ moneyNeed })
                    let buyLimit = 25000;
                    if (response.coin <= buyLimit && moneyNeed < home.balance) {
                        if (response.meal > home.meal) {
                            let needMealCount = response.meal - home.meal;
                            let seller = findAccountToBuyResource(0, needMealCount, home.user);

                            if (!seller) {
                                // console.log("Нет своих аккаунтов для покупки ресурса");
                                resolve();
                                return;
                            }

                            let buyResResponse = await api.buyResource({
                                price: 0.001,
                                resource: 0,
                                user: seller.id,
                                amount: needMealCount,
                            });

                            // console.log(buyResResponse);
                        }

                        let buyResponse = await api.buyWorker(user);
                        // console.log(buyResponse)


                        if (buyResponse && buyResponse.desc.includes("Прокачай")) {
                            // console.log("!!!!!!!!!!!!")

                            let upgradeInfo = await api.getUpgradeCompanyInfo();
                            let bricks = upgradeInfo.brick;
                            let nets = upgradeInfo.net;

                            let bricksNeeds = Math.max(0, bricks - home.brick);
                            let netsNeeds = Math.max(0, nets - home.net);

                            if (bricksNeeds > 0) {
                                let seller = findAccountToBuyResource(2, bricksNeeds, home.user);

                                if (!seller) {
                                    // console.log("Нет своих аккаунтов для покупки bricks");
                                    resolve();
                                    return;
                                }

                                let buyResResponse = await api.buyResource({
                                    price: 0.001,
                                    resource: 2,
                                    user: seller.id,
                                    amount: bricksNeeds,
                                });
                            }

                            if (netsNeeds > 0) {
                                let seller = findAccountToBuyResource(4, netsNeeds, home.user);

                                if (!seller) {
                                    // console.log("Нет своих аккаунтов для покупки nets");
                                    resolve();
                                    return;
                                }

                                let buyResResponse = await api.buyResource({
                                    price: 0.001,
                                    resource: 4,
                                    user: seller.id,
                                    amount: netsNeeds,
                                });
                            }

                            let upgrade = await api.upgradeCompany();
                            // console.log(upgrade)

                            let buyResponse = await api.buyWorker(user);
                            // console.log(buyResponse)

                        }
                    }
                    resolve();
                })

            });
        }

        // await Promise.all(promises);
        await sleep(20000);
        await tryToBuySomeone();
    };
    // tryToBuySomeone();


    let tryToUpgradeSomeone = async () => {
        // console.log("Пытаемся купить игроков....")

        let isLoaded = (resourceKeepers.filter(rc => rc.home)).length === 5;
        let promises = [];

        // let ourWorkers = getOurWorkers();

        if (isLoaded) {
            promises = accounts.map(async ({ api, home, resources }, i) => {
                await sleep(10);

                return new Promise(async (resolve, reject) => {
                    if (!home) {
                        resolve();
                        return;
                    }

                    let workers = [];

                    if (home.workers) {
                        workers = home.workers.sort(((a, b) => {
                            return a[8] - b[8]
                        }))
                    }

                    // console.log(workers)

                    let user = workers[0];
                    if (!user || !user[0]) {
                        resolve();
                        return;
                    }
                    let worker_id = user[0];
                    // name = worker[1];
                    // photo = worker[2];
                    // sex = worker[3];
                    // rareness = worker[4];
                    // lvl = worker[5];
                    // upgrade_price = worker[6];
                    // hp = worker[7];
                    // hp_max = worker[8];
                    // r_type = worker[9];
                    // power = worker[10];
                    // immune = worker[11];

                    let response = await api.getUpgradeWorkerInfo(worker_id);
                    // console.log({response})
                    if (response.response === "error") {

                        if (response.desc && response.desc.includes("Прокачай")) {
                            console.log("!!!!!!!!!!!!")

                            let upgradeInfo = await api.getUpgradeCompanyInfo();
                            let bricks = upgradeInfo.brick;
                            let nets = upgradeInfo.net;

                            let bricksNeeds = Math.max(0, bricks - home.brick);
                            let netsNeeds = Math.max(0, nets - home.net);

                            if (bricksNeeds > 0) {
                                let seller = findAccountToBuyResource(2, bricksNeeds, home.user);

                                if (!seller) {
                                    // console.log("Нет своих аккаунтов для покупки bricks");
                                    resolve();
                                    return;
                                }

                                let buyResResponse = await api.buyResource({
                                    price: 0.001,
                                    resource: 2,
                                    user: seller.id,
                                    amount: bricksNeeds,
                                });
                            }

                            if (netsNeeds > 0) {
                                let seller = findAccountToBuyResource(4, netsNeeds, home.user);

                                if (!seller) {
                                    // console.log("Нет своих аккаунтов для покупки nets");
                                    resolve();
                                    return;
                                }

                                let buyResResponse = await api.buyResource({
                                    price: 0.001,
                                    resource: 4,
                                    user: seller.id,
                                    amount: netsNeeds,
                                });
                            }

                            let upgrade = await api.upgradeCompany();
                            // console.log(upgrade)

                        }

                        resolve();
                        return;
                    }

                    let unis = response.uni;
                    let nets = response.net;

                    let unisNeeds = Math.max(0, unis - home.uni);
                    let netsNeeds = Math.max(0, nets - home.net);

                    if (unisNeeds > 0) {
                        let seller = findAccountToBuyResource(3, unisNeeds, home.user);

                        if (!seller) {
                            // console.log("Нет своих аккаунтов для покупки unis");
                            resolve();
                            return;
                        }

                        let buyResResponse = await api.buyResource({
                            price: 0.001,
                            resource: 3,
                            user: seller.id,
                            amount: unisNeeds,
                        });
                    }

                    if (netsNeeds > 0) {
                        let seller = findAccountToBuyResource(4, netsNeeds, home.user);

                        if (!seller) {
                            // console.log("Нет своих аккаунтов для покупки nets");
                            resolve();
                            return;
                        }

                        let buyResResponse = await api.buyResource({
                            price: 0.001,
                            resource: 4,
                            user: seller.id,
                            amount: netsNeeds,
                        });
                    }

                    let upgrade = await api.upgradeWorker(worker_id);
                    // console.log(upgrade)

                    resolve();
                })

            });
        }

        await Promise.all(promises);
        // await sleep(500);
        await tryToUpgradeSomeone();
    };
    // tryToUpgradeSomeone();

    let tryToHealSomeone = async () => {
        // console.log("Пытаемся купить игроков....")

        let isLoaded = (resourceKeepers.filter(rc => rc.home)).length === 5;
        let promises = [];

        // let ourWorkers = getOurWorkers();

        if (isLoaded) {
            promises = accounts.map(async ({ api, home, resources }, i) => {
                await sleep(10);

                return new Promise(async (resolve, reject) => {
                    if (!home) {
                        resolve();
                        return;
                    }

                    let workers = [];

                    if (home.workers) {
                        workers = home.workers.sort(((a, b) => {
                            return a[7] - b[7]
                        }))
                    }

                    // console.log(workers)

                    let user = workers[0];
                    if (!user || !user[0] || workers[7] >= 2) {
                        resolve();
                        return;
                    }
                    let worker_id = user[0];
                    // name = worker[1];
                    // photo = worker[2];
                    // sex = worker[3];
                    // rareness = worker[4];
                    // lvl = worker[5];
                    // upgrade_price = worker[6];
                    // hp = worker[7];
                    // hp_max = worker[8];
                    // r_type = worker[9];
                    // power = worker[10];
                    // immune = worker[11];

                    let response = await api.getHealWorkerInfo(worker_id);
                    if (response.error) {
                        resolve();
                        return;
                    }

                    let needMealCount = 50 - home.meal;
                    let seller = findAccountToBuyResource(0, needMealCount, home.user);

                    if (needMealCount > 0) {
                        if (!seller) {
                            // console.log("Нет своих аккаунтов для покупки ресурса");
                            resolve();
                            return;
                        }

                        let buyResResponse = await api.buyResource({
                            price: 0.001,
                            resource: 0,
                            user: seller.id,
                            amount: needMealCount,
                        });
                    }

                    let heal = await api.healWorker(worker_id);
                    // console.log(heal)

                    resolve();
                })

            });
        }

        // await Promise.all(promises);
        await sleep(60000);
        await tryToHealSomeone();
    };
    // tryToHealSomeone();

    let tryToWatchAd = async () => {
        // console.log("Пытаемся купить игроков....")

        let isLoaded = (resourceKeepers.filter(rc => rc.home)).length === 5;
        let promises = [];

        // let ourWorkers = getOurWorkers();

        if (isLoaded) {
            promises = accounts.map(async ({ api, home, resources }, i) => {
                await sleep(10);

                return new Promise(async (resolve, reject) => {
                    if (!home) {
                        resolve();
                        return;
                    }

                    let response = await api.getShowAd();
                    if (response.can_view != "0") {
                        await sleep(31000);
                        let showAd = await api.showAd();
                    }

                    resolve();
                })

            });
        }

        // await Promise.all(promises);
        await sleep(300000);
        await tryToWatchAd();
    };
    // tryToWatchAd();

    setInterval(async () => {
        let stats = {
            accounts: 0,

            noworkers: 0,

            workers: 0,
            workers_slots: 0,

            balance: 0,
            balance_in_res: 0,

            balance_min: 0,
            res_min: 0,

            worth: 0,
            worth_min: 0,

            meal: 0,
            aid: 0,
            brick: 0,
            uni: 0,
            net: 0,

            meal_min: 0,
            aid_min: 0,
            brick_min: 0,
            uni_min: 0,
            net_min: 0,

            can_buy_users_count: canBuyUsers.length,
        };


        accounts.map(({ home }, i) => {
            if (home) {
                let { balance, meal, aid, brick, uni, net, speed_wrk, speed_own, wcount, comp_places } = home;
                balance = Number(balance);
                meal = Number(meal);
                aid = Number(aid);
                brick = Number(brick);
                uni = Number(uni);
                net = Number(net);
                speed_wrk = Number(speed_wrk);
                speed_own = Number(speed_own);
                wcount = Number(wcount);
                comp_places = Number(comp_places);

                stats.accounts += 1;

                if (wcount == 0) {
                    stats.noworkers += 1;
                }


                stats.balance = Number((stats.balance + balance).toFixed(2));
                stats.balance_min = Number((stats.balance_min + speed_own).toFixed(2));
                stats.balance_in_res = Number((stats.balance_in_res + (meal + aid + brick + uni + net) * 0.001).toFixed(2));
                stats.res_min = Number((stats.res_min + speed_wrk).toFixed(2));
                stats.worth = Number((stats.balance + stats.balance_in_res).toFixed(2));
                stats.worth_min = Number((stats.balance_min + (stats.res_min * 0.001)).toFixed(2));
                stats.meal += meal;
                stats.aid += aid;
                stats.brick += brick;
                stats.uni += uni;
                stats.net += net;

                if (home.res_type == 0) {
                    stats.meal_min += speed_wrk;
                }
                if (home.res_type == 1) {
                    stats.aid_min += speed_wrk;
                }
                if (home.res_type == 2) {
                    stats.brick_min += speed_wrk;
                }
                if (home.res_type == 3) {
                    stats.uni_min += speed_wrk;
                }
                if (home.res_type == 4) {
                    stats.net_min += speed_wrk;
                }

                stats.workers += wcount;
                stats.workers_slots += comp_places;

                // if (lord ==0 && accounts[i].check) {
                //     console.log("noref ===========")
                //     let newAccs = accounts.filter(a => (a.home && a.home.lord == 0 && a.home.wcount == 0 && a.home.hashlink));
                //     // console.log(newAccs)
                //     if (newAccs.length > 0) {
                //
                //         // accounts[i].ws.send(JSON.stringify({ type: "init", url: account.url + "#" + (chance.pickone(newAccs)).hashlink }));
                //
                //        
                //         accounts[i].ws.send(JSON.stringify({
                //             user: account.id,
                //             check: accounts[i].check,
                //             type: "home",
                //             hash: (chance.pickone(newAccs)).hashlink
                //         }));
                //         // accounts[i].ws.send(JSON.stringify({
                //         //     user: account.id,
                //         //     check: accounts[i].check,
                //         //     type: "home",
                //         //     hash: chance.pickone(newAccs)
                //         // }));
                //     }
                // }
            }
        })

        console.table(stats);

        // if (stats.noRef == 58){
        //     let newAccs = accounts.filter(a => (a.home && a.home.lord == 0 && a.home.wcount == 0 && a.home.hashlink));
        //
        //    await writeFile("hash_links.json", JSON.stringify(newAccs.map(({id, home})=>({id, hashlink:home.hashlink}))));
        //    process.exit(1);
        //
        // }
    }, 30000)


    // setTimeout(()=>{
    //     process.exit()
    // }, 1000*60*5);

})();


function findAccountToBuyResource(resource, count, myId) {
    let sellers = accounts.filter(a => a.home && a.home.res_type == resource && a.my_offer && a.my_offer.reserve >= count && a.home.user != myId);
    return sellers.length > 0 ? chance.pickone(sellers) : null;
}

function getOurWorkers() {
    let workers = [];

    accounts.map(a => {
        if (a.home && a.home.workers) {
            let users = a.home.workers.map(([user]) => Number(user));
            workers = [...new Set([...workers, ...users])]
        }
    })

    return workers;
}