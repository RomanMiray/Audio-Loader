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