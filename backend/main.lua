local logger = require("logger")
local millennium = require("millennium")
local fs = require("fs")

<<<<<<< HEAD
-- ================== PATHS ==================
=======
-- ================== OS / PATHS ==================

-- Probably there is no need for these path separators vars
local IS_WINDOWS = package.config:sub(1,1) == "\\"
local PATH_SEPARATOR = IS_WINDOWS and "\\" or "/"
>>>>>>> c78cdeed3e15ab8e8346a0c3f45dfe79de259ebd

local STEAM_ROOT = millennium.steam_path()
local PLUGIN_ROOT = fs.join(STEAM_ROOT, "plugins", "AudioLoader")
local PACKS_PATH = fs.join(PLUGIN_ROOT, "packs")
local STEAM_SOUNDS_PATH = fs.join(STEAM_ROOT, "steamui", "sounds")
local CONFIG_PATH = fs.join(PLUGIN_ROOT, "config.txt")

-- ================== LOGGER ==================

logger:info("=== Audio Loader Backend (fs) ===")
logger:info("Steam root: " .. STEAM_ROOT)
logger:info("Plugin root: " .. PLUGIN_ROOT)
logger:info("Packs path: " .. PACKS_PATH)
logger:info("Steam sounds path: " .. STEAM_SOUNDS_PATH)
logger:info("Config path: " .. CONFIG_PATH)
logger:info("================================")

-- ================== HELPERS ==================

local function is_audio_file(filename)
    local ext = fs.extension(filename):lower()
    return ext == ".wav" or ext == ".mp3"
end

local function copy_pack(src_dir, dst_dir)
    if not fs.exists(src_dir) or not fs.is_directory(src_dir) then
        logger:error("Invalid source directory: " .. src_dir)
        return false
    end

    local entries = fs.list(src_dir)
    if not entries then
        logger:error("Failed to list directory: " .. src_dir)
        return false
    end

    for _, entry in ipairs(entries) do
        local name = entry.name
        if type(name) == "string" and is_audio_file(name) then
            local src_file = fs.join(src_dir, name)
            local dst_file = fs.join(dst_dir, name)

            if fs.is_file(src_file) then
                fs.copy(src_file, dst_file)
            end
        end
    end

    return true
end

-- ================== CONFIG ==================

local function save_selected_pack(pack)
    local f = io.open(CONFIG_PATH, "w")
    if f then
        f:write(pack)
        f:close()
        logger:info("Saved selected pack: " .. pack)
    end
end

local function load_selected_pack()
    local f = io.open(CONFIG_PATH, "r")
    if not f then
        return "steamdeck"
    end

    local pack = f:read("*l")
    f:close()
    return pack or "steamdeck"
end

-- ================== CORE LOGIC ==================

local function apply_pack(pack_name)
    pack_name = tostring(pack_name):lower()

    local base_pack = fs.join(PACKS_PATH, "steamdeck")
    local target_pack = fs.join(PACKS_PATH, pack_name)

    if not fs.exists(base_pack) then
        logger:error("Base pack not found: " .. base_pack)
        return false
    end

    logger:info("Restoring SteamDeck base sounds")
    copy_pack(base_pack, STEAM_SOUNDS_PATH)

    if pack_name ~= "steamdeck" then
        if not fs.exists(target_pack) then
            logger:error("Target pack not found: " .. target_pack)
            return false
        end

        logger:info("Applying pack: " .. pack_name)
        copy_pack(target_pack, STEAM_SOUNDS_PATH)
    end

    save_selected_pack(pack_name)
    logger:info("Pack applied successfully: " .. pack_name)
    return true
end

-- ================== FRONTEND CALLBACKS ==================

function switch_pack_callback(args)
    local pack =
        type(args) == "table" and (args.packName or args[1])
        or tostring(args)

    if not pack then
        return false
    end

    return apply_pack(pack)
end

function get_current_pack()
    return load_selected_pack()
end

-- ================== MILLENNIUM HOOKS ==================

local function on_load()
    logger:info("Audio Loader backend loaded")
    millennium.ready()
end

local function on_unload()
    logger:info("Audio Loader backend unloaded")
end

local function on_frontend_loaded()
    logger:info("Frontend loaded → restoring last selected pack")
    apply_pack(load_selected_pack())
end

return {
    on_load = on_load,
    on_unload = on_unload,
    on_frontend_loaded = on_frontend_loaded,
    switch_pack_callback = switch_pack_callback,
    get_current_pack = get_current_pack
}
