const path = require("path");
const setting = require("./setting.json");
const pkg = require("./package.json");
const { JX3BOX } = require("@jx3box/jx3box-common");
module.exports = {
    //❤️ Multiple pages ~
    // pages: {
    //     index: {
    //         title: "Home",
    //         entry: "src/main.js",
    //         template: "public/index.html",
    //         filename: "index.html",
    //     },
    //     $project: {
    //         title: "Project",
    //         entry: "src/core/$project/index.js",
    //         template: "public/$project/index.html",
    //         filename: "$project/index.html",
    //     },
    // },

    //⚛️ Proxy ~
    devServer: {
        proxy: {
            // "/api/cms": {
            //     target: process.env["DEV_SERVER"] == "true" ? "localhost" : "remote",
            // },
        },
    },

    //❤️ define path for static files ~
    publicPath:
        //FOR Localhost => development
        (process.env.NODE_ENV === "development" && "/") ||
        //BY origin
        (process.env.STATIC_PATH === "origin" && `${JX3BOX.__staticPath["origin"]}${pkg.name}/`) ||
        //BY github
        (process.env.STATIC_PATH === "github" && `${JX3BOX.__staticPath["github"]}${pkg.name}/`) ||
        //BY jsdelivr
        (process.env.STATIC_PATH === "jsdelivr" && `${JX3BOX.__staticPath["jsdelivr"]}${pkg.name}@gh-pages/`) ||
        //BY OSS=>CDN
        (process.env.STATIC_PATH === "mirror" && `${JX3BOX.__staticPath["mirror"]}${pkg.name}/`) ||
        //BY relative path
        (process.env.STATIC_PATH === "repo" && `/${pkg.name}/`) ||
        //BY root path or bind a domain
        (process.env.STATIC_PATH == "root" && "/") ||
        //for lost
        "/",

    //❤️ Webpack configuration
    chainWebpack: (config) => {
        //💘 html-webpack-plugin ~
        // Multiple pages disable the block below
        config.plugin("html").tap((args) => {
            args[0].meta = {
                //------设置SEO信息
                Keywords: setting.keys,
                Description: setting.desc,
            };
            args[0].title = setting.title; //------自动添加标题后缀
            return args;
        });

        //💝 in-line small imgs ~
        config.module.rule("images").set("parser", {
            dataUrlCondition: {
                maxSize: 4 * 1024, // 4KiB
            },
        });

        //💝 in-line svg imgs ~
        config.module.rule("vue").use("vue-svg-inline-loader").loader("vue-svg-inline-loader");

        //💖 import common less var * mixin ~
        const types = ["vue-modules", "vue", "normal-modules", "normal"];
        types.forEach((type) => addStyleResource(config.module.rule("less").oneOf(type)));
    },
};

function addStyleResource(rule) {
    var preload_styles = [];
    preload_styles.push(
        path.resolve(__dirname, "./node_modules/csslab/base.less"),
        path.resolve(__dirname, "./src/assets/css/var.less")
    );
    rule.use("style-resource").loader("style-resources-loader").options({
        patterns: preload_styles,
    });
}
