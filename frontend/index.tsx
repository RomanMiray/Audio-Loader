local logger = require("logger")
local millennium = require("millennium")

-- ================== OS / PATHS ==================

-- Probably there is no need for these path separators
local IS_WINDOWS = package.config:sub(1,1) == "\\"
local PATH_SEPARATOR = IS_WINDOWS and "\\" or "/"

local STEAM_ROOT = millennium.steam_path()
local PLUGIN_ROOT = STEAM_ROOT .. PATH_SEPARATOR .. "plugins" .. PATH_SEPARATOR .. "AudioLoader"
local PACKS_PATH = PLUGIN_ROOT .. PATH_SEPARATOR .. "packs"
local STEAM_SOUNDS_PATH = STEAM_ROOT .. PATH_SEPARATOR .. "steamui" .. PATH_SEPARATOR .. "sounds"
local CONFIG_PATH = PLUGIN_ROOT .. PATH_SEPARATOR .. "config.txt"

-- ================== LOGGER ==================
logger:info("=== Audio Loader Backend ===")
logger:info("Steam root: " .. STEAM_ROOT)
logger:info("Plugin root: " .. PLUGIN_ROOT)
logger:info("Packs path: " .. PACKS_PATH)
logger:info("Steam sounds path: " .. STEAM_SOUNDS_PATH)
logger:info("Config path: " .. CONFIG_PATH)
logger:info("Running on Windows: " .. tostring(IS_WINDOWS))
logger:info("Path separator: " .. PATH_SEPARATOR)
logger:info("================================")

-- ================== HELPERS ==================
local function is_audio_file(name)
    return name:match("%.wav$") or name:match("%.mp3$")
end

<<<<<<< HEAD
    useEffect(() => {
        getCurrentPack().then(pack => {
            if (pack) setSelectedData(pack.toLowerCase());
        });
    }, []);

    return (
        <Field
            label="Audio Pack" 
            icon={<IconsModule.Settings />}
            bottomSeparator="standard"
            focusable
        >
            <Dropdown
                rgOptions={options}
                selectedOption={selectedOption}
=======
local function list_files(dir)
    local files = {}
    local cmd = IS_WINDOWS and ('dir "' .. dir .. '" /b') or ('ls "' .. dir .. '"')
    local p = io.popen(cmd)
    if not p then return files end
    for file in p:lines() do
        table.insert(files, file)
    end
    p:close()
    return files
end

local function copy_file(src, dst)
    local in_f = io.open(src, "rb")
    if not in_f then return false end
    local data = in_f:read("*all")
    in_f:close()

    local out_f = io.open(dst, "wb")
    if not out_f then return false end
    out_f:write(data)
    out_f:close()
>>>>>>> c78cdeed3e15ab8e8346a0c3f45dfe79de259ebd

    return true
end

local function copy_pack(src_dir, dst_dir)
    for _, file in ipairs(list_files(src_dir)) do
        if is_audio_file(file) then
            copy_file(src_dir .. PATH_SEPARATOR .. file, dst_dir .. PATH_SEPARATOR .. file)
        end
    end
end

<<<<<<< HEAD
export default definePlugin(() => ({
    title: 'Audio Loader',
    icon: <IconsModule.Settings />,
    content: <SettingsContent />,
}));
=======
local function dir_exists(path)
    local p = io.popen(
        IS_WINDOWS and ('dir "' .. path .. '" /b 2>nul')
        or ('ls "' .. path .. '" 2>/dev/null')
    )
    if not p then return false end
    local ok = p:read("*l") ~= nil
    p:close()
    return ok
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
    if not f then return "steamdeck" end
    local pack = f:read("*l")
    f:close()
    return pack or "steamdeck"
end

-- ================== CORE LOGIC ==================
local function apply_pack(pack_name)
    pack_name = tostring(pack_name):lower()

    local base_pack = PACKS_PATH .. PATH_SEPARATOR .. "steamdeck"
    local target_pack = PACKS_PATH .. PATH_SEPARATOR .. pack_name

    if not dir_exists(base_pack) then
        logger:error("Base pack (steamdeck) not found at: " .. base_pack)
        return false
    end

    logger:info("Restoring SteamDeck base sounds...")
    copy_pack(base_pack, STEAM_SOUNDS_PATH)

    if pack_name ~= "steamdeck" then
        if not dir_exists(target_pack) then
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
    local pack = type(args) == "table" and (args.packName or args[1]) or tostring(args)
    if not pack then return false end
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
    local pack = load_selected_pack()
    apply_pack(pack)
end

return {
    on_load = on_load,
    on_unload = on_unload,
    on_frontend_loaded = on_frontend_loaded,
    switch_pack_callback = switch_pack_callback,
    get_current_pack = get_current_pack
}
>>>>>>> c78cdeed3e15ab8e8346a0c3f45dfe79de259ebd
