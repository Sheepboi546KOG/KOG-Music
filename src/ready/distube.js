const { EmbedBuilder } = require('discord.js');

module.exports = (distube) => {
    distube.on('addSong', (queue, song) => {
        const embed = new EmbedBuilder()
            .setColor('#1DB954')
            .setTitle('Song Added')
            .setDescription(`Added **${song.name}** to the queue! 🎶`);
        queue.textChannel.send({ embeds: [embed] });
    });

    distube.on('playSong', (queue, song) => {
        const embed = new EmbedBuilder()
          .setTitle('Now Playing')
          .setDescription(`[${song.name}](${song.url})`)
          .setImage(song.thumbnail)
          .addFields(
            { name: 'Duration', value: song.formattedDuration, inline: true },
            { name: 'Requested by', value: `${song.user}`, inline: true }
          )
          .setColor('Blue');
        
        queue.textChannel.send({ embeds: [embed] });
      });

    distube.on('stop', (queue) => {
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Playback Stopped')
            .setDescription(`Music playback has been stopped. 🛑`);
        queue.textChannel.send({ embeds: [embed] });
    });

    distube.on('rewind', (queue, time) => {
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('Rewind')
            .setDescription(`Rewound the song by **${time} seconds**. ⏪`);
        queue.textChannel.send({ embeds: [embed] });
    });

    distube.on('fastForward', (queue, time) => {
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('Fast Forward')
            .setDescription(`Fast-forwarded the song by **${time} seconds**. ⏩`);
        queue.textChannel.send({ embeds: [embed] });
    });
};