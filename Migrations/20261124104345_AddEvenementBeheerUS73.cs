using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Avond4_DaagseGroep3.Migrations
{
    /// <inheritdoc />
    public partial class AddEvenementBeheerUS73 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "InschrijvingOpen",
                table: "Evenementen",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InschrijvingSluit",
                table: "Evenementen",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsGepubliceerd",
                table: "Evenementen",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "EvenementAfstanden",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EvenementId = table.Column<int>(type: "int", nullable: false),
                    AfstandKm = table.Column<int>(type: "int", nullable: false),
                    Prijs = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Starttijd = table.Column<TimeSpan>(type: "time", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EvenementAfstanden", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EvenementAfstanden_Evenementen_EvenementId",
                        column: x => x.EvenementId,
                        principalTable: "Evenementen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EvenementAfstanden_EvenementId",
                table: "EvenementAfstanden",
                column: "EvenementId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EvenementAfstanden");

            migrationBuilder.DropColumn(
                name: "InschrijvingOpen",
                table: "Evenementen");

            migrationBuilder.DropColumn(
                name: "InschrijvingSluit",
                table: "Evenementen");

            migrationBuilder.DropColumn(
                name: "IsGepubliceerd",
                table: "Evenementen");
        }
    }
}
