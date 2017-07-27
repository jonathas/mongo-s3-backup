const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const tsProject = require("gulp-typescript").createProject("tsconfig.json");
const vfs = require("vinyl-fs");

const paths = {
    tocopy: ["./**", "!./.git", "!./.git/**", "!./bin", "!./bin/**", "!./**/*.ts", "!./.vscode", "!./.vscode/**", "!./gulpfile.js", "!./*.log", "!./*.lock", "!./*.md",
        "!./*.json", "!./.editorconfig", "!./.gitignore", "!./.jshintrc", "!./.istanbul.yml", "!./LICENSE", "!./test/unit/*.ts", "!./test/mocha.opts",
        "!./coverage", "!./coverage/**", "!./.dockerignore", "!./docker-compose.yml", "!./Dockerfile", "!./node_modules", "!./node_modules/**",
        "!./Makefile"
    ],
    tsfiles: ["./**, ./config", "./lib", "./test"]
};

gulp.task("copy", () => {
    return vfs.src(paths.tocopy, {
            dot: true
        })
        .pipe(vfs.dest("./bin"));
});

gulp.task("transpile", () => {
    return tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject()).js
        .pipe(sourcemaps.write("./maps"))
        .pipe(gulp.dest("./bin"));
});

gulp.task("default", ["copy", "transpile"], (done) => done());

gulp.task("watch", () => {
    gulp.watch(paths.tsfiles, ["transpile"]);
});