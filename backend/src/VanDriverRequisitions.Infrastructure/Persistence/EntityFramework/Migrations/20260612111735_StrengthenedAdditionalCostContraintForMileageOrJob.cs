using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VanDriverRequisitions.Infrastructure.Persistence.EntityFramework.Migrations
{
    /// <inheritdoc />
    public partial class StrengthenedAdditionalCostContraintForMileageOrJob : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_MutuallyExclusive",
                table: "FeAdditionalCosts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_MutuallyExclusive",
                table: "FeAdditionalCosts",
                sql: "([ChargingOption] = 0 AND [Miles] IS NOT NULL AND [RatePerMile] IS NOT NULL AND [TotalNumber] IS NULL AND [RatePerJob] IS NULL) OR ([ChargingOption] = 1 AND [TotalNumber] IS NOT NULL AND [RatePerJob] IS NOT NULL AND [Miles] IS NULL AND [RatePerMile] IS NULL)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_FeAdditionalCosts_MutuallyExclusive",
                table: "FeAdditionalCosts");

            migrationBuilder.AddCheckConstraint(
                name: "CK_FeAdditionalCosts_MutuallyExclusive",
                table: "FeAdditionalCosts",
                sql: "([ChargingOption] = 0 AND [Miles] IS NOT NULL AND [TotalNumber] IS NULL) OR ([ChargingOption] = 1 AND [TotalNumber] IS NOT NULL AND [Miles] IS NULL)");
        }
    }
}
