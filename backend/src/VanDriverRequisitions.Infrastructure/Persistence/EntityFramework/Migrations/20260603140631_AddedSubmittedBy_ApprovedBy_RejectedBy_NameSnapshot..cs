using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class AddedSubmittedBy_ApprovedBy_RejectedBy_NameSnapshot : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ProcessedById",
                table: "FeRequisitions",
                newName: "ApprovedById");

            migrationBuilder.RenameColumn(
                name: "ProcessedAtUtc",
                table: "FeRequisitions",
                newName: "ApprovedAtUtc");

            migrationBuilder.AddColumn<string>(
                name: "ApprovedByNameSnapshot",
                table: "FeRequisitions",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectedByNameSnapshot",
                table: "FeRequisitions",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubmittedByNameSnapshot",
                table: "FeRequisitions",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovedByNameSnapshot",
                table: "FeRequisitions");

            migrationBuilder.DropColumn(
                name: "RejectedByNameSnapshot",
                table: "FeRequisitions");

            migrationBuilder.DropColumn(
                name: "SubmittedByNameSnapshot",
                table: "FeRequisitions");

            migrationBuilder.RenameColumn(
                name: "ApprovedById",
                table: "FeRequisitions",
                newName: "ProcessedById");

            migrationBuilder.RenameColumn(
                name: "ApprovedAtUtc",
                table: "FeRequisitions",
                newName: "ProcessedAtUtc");
        }
    }
}
