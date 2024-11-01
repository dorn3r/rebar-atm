import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';;
import { BlipColor } from '@Shared/types/blip.js';
import { useTranslate } from '@Shared/translate.js';
import { atmConfig } from '../shared/config.js';
import atms from '../shared/atms.js';
import '../translate/index.js';

const { t } = useTranslate('en');

const Rebar = useRebar();
const api = Rebar.useApi();

const startcash = 5000 as number; //set new player cash
const startbank = 5000 as number; //set new player bank

const { useCurrency } = await api.getAsync('currency-api');
const notificationApi = await api.getAsync('ascended-notification-api');

async function handleCharacterCreated(player: alt.Player) {
    const document = Rebar.document.character.useCharacter(player);
    const data = document.get();
    const characterCurrency = useCurrency(player, 'Character');

    if (!data) {
        return;
    }

    if (data.cash === undefined || data.cash === null) {
        characterCurrency.add('cash', startcash);
    }

    if (data.bank === undefined || data.bank === null) {
        characterCurrency.add('bank', startbank);
    }

    for (let i = 0; i < atms.length; i++) {
        const position = atms[i];

        // Create TextLabel Global
        Rebar.controllers.useTextLabelGlobal({ text: t('openatm'), pos: position });

        // When atmConfig setting showAtmBlips equals true show blips
        if (atmConfig.Settings.showAtmBlips === true) {
            Rebar.controllers.useBlipGlobal({
                pos: position,
                color: BlipColor.LIGHT_GREEN,
                sprite: 500,
                shortRange: true,
                text: 'ATM',
            });
        }

        // Create Interaction
        const interaction = Rebar.controllers.useInteraction(new alt.ColshapeCylinder(position.x, position.y, position.z, 3, 2), 'player');

        // Listen for the player to hit 'E' to interact
        interaction.on(handleInteraction);

        /**
         * Listens for interaction on player and shows ATM webview
         * @param player alt.Player
         */
        async function handleInteraction(player: alt.Player) {
            const character = Rebar.document.character.useCharacter(player);
            const data = character.get();

            const view = Rebar.player.useWebview(player);
            Rebar.player.useWorld(player).disableControls();
            view.show('Atm', 'page');
            view.emit('atm:update', data.bank, data.cash);
        }
    }
}

alt.onClient(`Atm:Close`, (player: alt.Player) => {
    const view = Rebar.player.useWebview(player);
    view.hide('Atm');
    Rebar.player.useWorld(player).enableControls();
});

alt.onClient(`Atm:deposit`, deposit);

async function deposit(player: alt.Player, value: number) {
    const characterCurrency = useCurrency(player, 'Character');

    const hascash = await characterCurrency.has('cash', value);

    if (!hascash) {
        return;
    }

    if (value <= 0) {
        return;
    }

    notificationApi.general.send(player, {
        icon: notificationApi.general.getTypes().SUCCESS,
        title: 'Bank',
        subtitle: 'ATM:',
        message: `Successfully deposited ${value}$`,
        duration: 5000,
        // oggFile: 'notification' //Optional: Sound effect file name
    });

    await characterCurrency.add('bank', value);
    await characterCurrency.sub('cash', value);

    const character = Rebar.document.character.useCharacter(player);
    const data = character.get();
    const view = Rebar.player.useWebview(player);
    view.emit('atm:update', data.bank, data.cash);
}

alt.onClient(`Atm:withdraw`, withdraw);

async function withdraw(player: alt.Player, value: number) {
    const { useCurrency } = await api.getAsync('currency-api');
    const characterCurrency = useCurrency(player, 'Character');

    const hasbank = await characterCurrency.has('bank', value);

    if (!hasbank) {
        return;
    }

    if (value <= 0) {
        return;
    }

    notificationApi.general.send(player, {
        icon: notificationApi.general.getTypes().SUCCESS,
        title: 'Bank',
        subtitle: 'ATM:',
        message: `Successfully withdrawn ${value}$`,
        duration: 5000,
        // oggFile: 'notification' //Optional: Sound effect file name
    });

    await characterCurrency.add('cash', value);
    await characterCurrency.sub('bank', value);

    const character = Rebar.document.character.useCharacter(player);
    const data = character.get();
    const view = Rebar.player.useWebview(player);
    view.emit('atm:update', data.bank, data.cash);
}

alt.on('rebar:playerCharacterBound', (player, document) => {
    handleCharacterCreated(player);
});
