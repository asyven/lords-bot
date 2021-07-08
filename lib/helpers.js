const util = require('util');
const fs = require('fs');
const rq = require('request');
const request = util.promisify(rq);
const sleep = util.promisify(setTimeout);

async function getGroupsUsers(groups, vk_token) {
    // let vk_token = settings.VK_TOKEN;
    let users = [];
    for (let i = 0; i < groups.length; i++) {
        let res = await sendRequest(`https://api.vk.com/method/groups.getMembers?group_id=${groups[i]}&offset=0&fields=uid&sort=id_asc&v=5.131&access_token=${vk_token}`);
        res = JSON.parse(res.body);
        // console.log(res);
        await sleep(350);
        if (res.response && res.response.count > 0) {
            for (let j = 0; j < Math.ceil(res.response.count / 1000); j++) {
                let res = await sendRequest(`https://api.vk.com/method/groups.getMembers?group_id=${groups[i]}&offset=${j * 1000}&fields=uid&sort=id_asc&v=5.131&access_token=${vk_token}`);
                res = JSON.parse(res.body);
                await sleep(350);
                if (res.response && res.response.items) {
                    console.log(`Group: ${groups[i]} offset ${j * 1000}`);
                    for (let k = 0; k < res.response.items.length; k++) {
                        users.push(res.response.items[k].id);
                    }
                }
            }
        }
    }
    return users;
}

async function sendRequest(url, type, data) {
    try {
        const res = await request({
            url: url,
            method: type,
            headers: {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3",
                "accept-language": "ru,en;q=0.9,uk;q=0.8,bg;q=0.7,und;q=0.6",
                "cache-control": "max-age=0",
                "upgrade-insecure-requests": "1"
            },
            body: data,
        });
        // console.
        // log(res.body)
        return res;
    } catch (e) {
        console.log(e);
        return null; 
    }

}

module.exports = {getGroupsUsers};