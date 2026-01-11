import { useEffect, useState } from 'react';
import {
    Millennium,
    IconsModule,
    definePlugin,
    Field,
    Dropdown,
    callable
} from '@steambrew/client';

// Backend callbacks
const switchPack = callable<[{ packName: string }], boolean>('switch_pack_callback');
const getCurrentPack = callable<[], string>('get_current_pack');

// Dropdown option type
type Option = { label: string; data: string };

const SettingsContent = () => {
    const options: Option[] = [
        { label: 'Steam Deck', data: 'steamdeck' },
        { label: 'PS4', data: 'ps4' },
        { label: 'PS5', data: 'ps5' },
        { label: 'Switch', data: 'switch' },
        { label: 'Switch 2', data: 'switch2' },
        { label: 'Xbox Series', data: 'xboxseries' },
    ];

    // Store selected pack
    const [selectedData, setSelectedData] = useState<string>('steamdeck');

    const selectedOption = options.find(o => o.data === selectedData)!;

    const descriptionText = [
        "(ADDING YOUR OWN SOUNDS ISN'T IMPLEMENTED YET! WORK IN PROGRESS!)",
        "(BACKGROUND MUSIC AND ADDING CUSTOM BACKGROUND MUSIC ISN'T IMPLEMENTED YET EITHER)",
        "PS3 and Xbox 360 will be added later",
        "Steam Deck is default theme. Choose any pack you want in the dropdown menu.",
        "To manually add your own pack, you need:",
        "1. Rename sound files (.mp3 or .wav) as default Steam UI sounds (Check steam_root -> steamui -> sounds folder)",
        "2. Open dropdown menu, click Add Custom Pack and select your folder",
        "3. Now choose it from the dropdown menu",
        "4. Enjoy!"
    ];

    useEffect(() => {
        getCurrentPack().then(pack => {
            if (pack) setSelectedData(pack.toLowerCase());
        });
    }, []);

    return (
        <Field
            label="Audio Pack"
            /* Let me know if there is more practical and suitable way to implement this */
            description={
                <>
                    {descriptionText.map((line, i) => (
                        <span key={i}>{line}<br /></span> 
                    ))}                                    
                </>
            } 
            icon={<IconsModule.Settings />}
            bottomSeparator="standard"
            focusable
        >
            <Dropdown
                rgOptions={options}
                selectedOption={selectedOption}

                // Render label
                renderButtonValue={() => selectedOption.label}

                onChange={(opt: Option) => {
                    setSelectedData(opt.data);
                    switchPack({ packName: opt.data });
                }}
            />
        </Field>
    );
};

export default definePlugin(() => ({
    title: 'Audio Loader',
    icon: <IconsModule.Settings />,
    content: <SettingsContent />,
}));
