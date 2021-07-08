module.exports = [
    // {
    //     id: Number, - обязательный параметр, айди акка
    //     url: String  - обяз., ссылка на iframe приложения, можно узнать через исходный код или через запрос apps.get с токеном от андроида\айфона,
    //     resource: Number - необяз, айди ресурса аккаунта, 0-4
    //     resourceKeeper: Bool - необяз. является акк складом (должен хранить все ресурсы и у него будут их выкупать),
    // },
    
    // пример заполненного конфига
    {
        id: 111,
        url: "https://lords-game.cc/?vk_access_token_settings=&vk_app_id=7118881&vk_are_notifications_enabled=0&vk_is_app_user=0&vk_is_favorite=0&vk_language=ru&vk_platform=mobile_web&vk_ref=other&vk_ts=1624630516&vk_user_id=111&sign=ZzruvRYFiGDdeotTw11232qH_4QsBcbbV0",
        resource: 0,
        resourceKeeper: true,
    },
    {
        id: 222,
        url: "https://lords-game.cc/?vk_access_token_settings=&vk_app_id=7118881&vk_are_notifications_enabled=0&vk_is_app_user=0&vk_is_favorite=0&vk_language=ru&vk_platform=mobile_android&vk_ref=other&vk_ts=1624629749&vk_user_id=222&sign=KNxAPS9Q_FpV-SmsQh123_NBhD2-w6J1uNls#39f5a371c",
        resource: 1,
        resourceKeeper: true,
    },
    {
        id: 333,
        url: "https://lords-game.cc/?vk_access_token_settings=&vk_app_id=7118881&vk_are_notifications_enabled=0&vk_is_app_user=0&vk_is_favorite=0&vk_language=ru&vk_platform=mobile_android&vk_ref=other&vk_ts=1624627233&vk_user_id=333&sign=wUEtq5PCrbcXW7mRz123p7YZWTb9-MTR4bKas",
        resource: 2,
        resourceKeeper: true,
    },
    {
        id: 444,
        url: "https://lords-game.cc/?vk_access_token_settings=&vk_app_id=7118881&vk_are_notifications_enabled=0&vk_is_app_user=0&vk_is_favorite=0&vk_language=ru&vk_platform=mobile_android&vk_ref=other&vk_ts=1624646382&vk_user_id=444&sign=n04l3hp64FE123WUvW8isamkbAzSjWFCrKsrzE",
        resource: 3,
        resourceKeeper: true,
    },
    {
        id: 555,
        url: "https://lords-game.cc/?vk_access_token_settings=&vk_app_id=7118881&vk_are_notifications_enabled=0&vk_is_app_user=0&vk_is_favorite=0&vk_language=ru&vk_platform=mobile_android&vk_ref=other&vk_ts=1624646386&vk_user_id=555&sign=ltFPF1ZdgG123BhodyIClp8fkKuzNMQ8aw",
        resource: 4,
        resourceKeeper: true,
    },
    {
        "id": 666,
        "url": "https://lords-game.cc/?vk_access_token_settings=&vk_app_id=7118881&vk_are_notifications_enabled=0&vk_is_app_user=0&vk_is_favorite=0&vk_language=ru&vk_platform=mobile_android&vk_ref=other&vk_ts=1624646384&vk_user_id=666&sign=666oalL7Pe7NS123liX-oIXvIuyo4kQ0u4hgZXE"
    },
];