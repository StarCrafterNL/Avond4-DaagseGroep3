using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Avond4_DaagseGroep3.Migrations
{
    /// <inheritdoc />
    public partial class AddEvenementTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Evenementen",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Naam = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Organisatie = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Locatie = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StartDatum = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EindDatum = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evenementen", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Evenementen");
        }
    }
}
