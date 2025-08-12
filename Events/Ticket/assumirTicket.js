const client = require('../../index');
const colors = require('colors');
const {StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');


client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.values[0] === "assumir_ticket") {
        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('optionsticket')
                    .setPlaceholder('Funçoes do ticket!')
                    .addOptions(
                        new StringSelectMenuOptionBuilder()
                            .setLabel("❌ㆍEncerrar")
                            .setDescription("Encerre o atendimento.")
                            .setValue("encerrar_atendimento"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("📜ㆍGerar transcript")
                            .setDescription("Gere um transcript de todo o atendimento.")
                            .setValue("gerar_transcript"),

                        new StringSelectMenuOptionBuilder()
                            .setLabel("📞ㆍAssumir ticket")
                            .setDescription("Assuma o ticket para atende-lo.")
                            .setValue("assumir_ticket"),
                    )
            )

        interaction.update({ components: [menu] }).then(async () => {
            if (!interaction.member.roles.cache.has(`${process.env.STAFF}`)) {
                interaction.followUp({
                    embeds: [new EmbedBuilder()
                        .setDescription(`___**${interaction.user} você não possui permissão!**___`)
                        .setColor(0xFF0000)
                    ],
                    ephemeral: true
                })
                return;
            }

            const message = await interaction.channel.messages.fetch(interaction.message.id);
            if (message.embeds.length > 0) {
                for (const embed of message.embeds) {
                    if (embed.fields && embed.fields.length > 0) {
                        for (const field of embed.fields) {
                            if (field.name === "**Atendente:**" && field.value === "`Ninguem atendendo o ticket!`") {
                                field.value = "`" + interaction.user.username + "`";
                                await message.edit({ embeds: [embed] }).then(() => {
                                    interaction.followUp({
                                        embeds: [new EmbedBuilder()
                                            .setDescription(`${interaction.user} **assumiu o atendimento!**`)
                                            .setColor(0x00FF00)
                                            .setTimestamp()
                                        ]
                                    })
                                })
                            } else {
                                if (field.name === "**Atendente:**") {
                                    interaction.followUp({
                                        embeds: [new EmbedBuilder()
                                            .setDescription(`_**${field.value} já assumiu este atendimento!**_`)
                                            .setColor(0xFF0000)
                                        ],
                                        ephemeral: true
                                    })
                                }
                            }
                        }
                    }
                }
            }
        })





    }
})