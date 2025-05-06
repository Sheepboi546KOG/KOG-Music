require('dotenv').config();
const { Client, Events, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');

const isDevMode = process.argv.includes('--dev');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();


const { DisTube } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { YtDlpPlugin } = require('@distube/yt-dlp');

const distube = new DisTube(client, {
    plugins: [
        new SpotifyPlugin(),
        new SoundCloudPlugin(),
        new YtDlpPlugin(),
    ],
});

client.distube = distube;


const distubeEvents = require('./ready/distube.js');  
distubeEvents(distube); 


const folders = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(folders);
for (const folder of commandFolders) {
    const commandsPath = path.join(folders, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}

client.once(Events.ClientReady, () => {
    if (!isDevMode) {
        console.log(`Logged in as ${client.user.tag}!`);
    } else {
        console.log(`Logged in as ${client.user.tag} in Development Mode!`);
    }

    const presences = isDevMode
        ? [
            { activities: [{ name: 'in Development Mode', type: ActivityType.Listening }], status: 'dnd' },
        ]
        : [
            { activities: [{ name: 'Master of Puppets - Metallica', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Enter Sandman - Metallica', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'One - Metallica', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Fade to Black - Metallica', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Nothing Else Matters - Metallica', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'For Whom the Bell Tolls - Metallica', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'The Unforgiven - Metallica', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Amerika - Rammstein', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Du Riechst so gut - Rammstein', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Sonne - Rammstein', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Du Hast - Rammstein', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Sonne - Rammstein', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Highway to Hell - AC/DC', type: ActivityType.Listening }], status: 'online' },
            { activities: [{ name: 'Hells Bells - AC/DC', type: ActivityType.Listening }], status: 'online' },
        ];

    let index = 0;
    setInterval(() => {
        client.user.setPresence(presences[index]);
        index = (index + 1) % presences.length;
    }, 20000);
});

client.on(Events.InteractionCreate, async (interaction) => {
    const devUsers = config.developers || [];

    if (interaction.isChatInputCommand()) {
        if (isDevMode && !devUsers.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [{
                    title: "Bot in Development Mode",
                    description: 'The bot is currently in development mode and only developers can run commands.',
                    color: 0xed4245,
                }],
                ephemeral: true,
            });
        }

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (command.dev && !devUsers.includes(interaction.user.id)) {
            return interaction.reply({
                embeds: [{
                    title: "Command in Dev Mode",
                    description: 'This command is not available to you and is under development.',
                    color: 0xed4245,
                }],
                ephemeral: true,
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error('Error executing command:', error);
            const reply = {
                content: 'There was an error while executing this command!',
                ephemeral: true,
            };
            interaction.replied || interaction.deferred
                ? await interaction.followUp(reply)
                : await interaction.reply(reply);
        }
    }
});

client.login(process.env.TOKEN);
