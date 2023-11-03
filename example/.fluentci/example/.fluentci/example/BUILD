load("@crate_index//:defs.bzl", "aliases", "all_crate_deps")
load("@rules_rust//rust:defs.bzl", "rust_library", "rust_test")

rust_library(
    name = "example",
    srcs = [
      "src/lib.rs",
    ],
    deps = all_crate_deps(),
)

rust_test(
    name = "example_test",
    srcs = [
      "src/lib.rs",
    ],
    deps = all_crate_deps(),
)
