using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class AddedExtraContraintToLimitRulesToSeparateGeneralTaskAndOtherCategories : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RestartSequence(
                name: "FeRequisitionNumber",
                startValue: 101L);

            migrationBuilder.CreateIndex(
                name: "IX_RequisitionLimitRules_Category_Fascia",
                table: "RequisitionLimitRules",
                columns: new[] { "Category", "Fascia" },
                unique: true,
                filter: "[FeTaskTypeId] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_RequisitionLimitRules_Category_Fascia",
                table: "RequisitionLimitRules");

            migrationBuilder.RestartSequence(
                name: "FeRequisitionNumber",
                startValue: 1L);
        }
    }
}
