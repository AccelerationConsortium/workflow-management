"""
N8N Connector Usage Examples

Demonstrates how to use the n8n connector in various scenarios.
"""

import asyncio
from datetime import datetime
from integrations.n8n_connector import (
    N8NClient, 
    N8NNotificationBuilder,
    ExperimentInfo, 
    ExperimentStatus, 
    NotificationLevel
)


async def example_experiment_notifications():
    """Example: Send experiment status notifications"""
    
    print("=== Experiment Notification Examples ===")
    
    # Create sample experiment
    experiment = ExperimentInfo(
        experiment_id="exp_demo_001",
        status=ExperimentStatus.COMPLETED,
        template_id="catalyst_characterization",
        started_by="researcher@lab.com",
        started_at=datetime(2024, 1, 15, 9, 0, 0),
        completed_at=datetime(2024, 1, 15, 10, 30, 0),
        progress=100.0,
        current_step="analysis_complete",
        total_steps=8,
        parameters={
            "temperature": 80,
            "scan_rate": 50,
            "cycles": 3
        },
        results={
            "peak_current": 1.2,
            "onset_potential": -0.3,
            "cycles_completed": 3
        }
    )
    
    async with N8NClient() as client:
        # Send completion notification
        success = await client.notify_experiment_status(
            experiment,
            custom_summary="CV characterization completed successfully. Peak current: 1.2A"
        )
        
        if success:
            print("✓ Experiment completion notification sent")
        else:
            print("✗ Failed to send notification")


async def example_alert_notifications():
    """Example: Send various types of alerts"""
    
    print("\n=== Alert Notification Examples ===")
    
    async with N8NClient() as client:
        
        # Temperature warning
        success = await client.send_alert(
            experiment_id="exp_demo_002",
            alert_type="temperature_warning",
            message="Reaction temperature exceeded safe operating limit (85°C vs 80°C target)",
            level=NotificationLevel.WARNING,
            requires_action=True,
            suggested_actions=[
                "Reduce heating power by 20%",
                "Increase cooling flow rate",
                "Pause experiment if temperature continues rising"
            ],
            metadata={
                "current_temperature": 85.2,
                "target_temperature": 80.0,
                "safety_limit": 85.0,
                "heating_power": 75
            }
        )
        
        if success:
            print("✓ Temperature warning alert sent")
        
        # Equipment failure alert
        success = await client.send_alert(
            experiment_id="exp_demo_003",
            alert_type="equipment_failure",
            message="Potentiostat connection lost during CV measurement",
            level=NotificationLevel.CRITICAL,
            requires_action=True,
            suggested_actions=[
                "Check USB connection to potentiostat",
                "Restart potentiostat software",
                "Switch to backup potentiostat"
            ],
            metadata={
                "equipment": "potentiostat_01",
                "last_response": "2024-01-15T10:45:23Z",
                "error_code": "COMM_TIMEOUT"
            }
        )
        
        if success:
            print("✓ Equipment failure alert sent")


async def example_report_notifications():
    """Example: Send report ready notifications"""
    
    print("\n=== Report Notification Examples ===")
    
    async with N8NClient() as client:
        
        # PDF report ready
        success = await client.notify_report_ready(
            experiment_id="exp_demo_001",
            report_url="https://canvas.lab.com/reports/exp_demo_001_summary.pdf",
            report_type="pdf",
            metadata={
                "report_size": "2.3MB",
                "pages": 15,
                "generated_at": datetime.utcnow().isoformat(),
                "includes_data": True,
                "includes_graphs": True
            }
        )
        
        if success:
            print("✓ PDF report notification sent")
        
        # Data export ready
        success = await client.notify_report_ready(
            experiment_id="exp_demo_001",
            report_url="https://canvas.lab.com/data/exp_demo_001_raw_data.zip",
            report_type="data_export",
            metadata={
                "file_size": "45.2MB",
                "file_count": 23,
                "formats": ["csv", "json", "png"],
                "compression": "zip"
            }
        )
        
        if success:
            print("✓ Data export notification sent")


async def example_custom_notifications():
    """Example: Use notification builder for custom notifications"""
    
    print("\n=== Custom Notification Examples ===")
    
    async with N8NClient() as client:
        
        # Equipment maintenance reminder
        success = await (N8NNotificationBuilder()
                        .experiment("maintenance_scheduled")
                        .summary("Weekly maintenance required for HPLC system")
                        .level(NotificationLevel.INFO)
                        .add_metadata("equipment", "HPLC_01")
                        .add_metadata("last_maintenance", "2024-01-08")
                        .add_metadata("next_due", "2024-01-15")
                        .add_metadata("estimated_duration", "2 hours")
                        .send_to(client, "maintenance-reminder", "equipment_maintenance"))
        
        if success:
            print("✓ Maintenance reminder sent")
        
        # Sample analysis complete
        success = await (N8NNotificationBuilder()
                        .experiment("sample_batch_001")
                        .summary("Batch analysis completed: 24/24 samples processed")
                        .level(NotificationLevel.INFO)
                        .add_metadata("samples_processed", 24)
                        .add_metadata("samples_passed", 22)
                        .add_metadata("samples_failed", 2)
                        .add_metadata("total_time", "4.5 hours")
                        .add_metadata("throughput", "5.3 samples/hour")
                        .send_to(client, "batch-analysis-complete", "sample_analysis"))
        
        if success:
            print("✓ Batch analysis notification sent")


async def example_error_handling():
    """Example: Error handling and notifications"""
    
    print("\n=== Error Handling Examples ===")
    
    async with N8NClient() as client:
        
        # Simulate various error scenarios
        errors = [
            ValueError("Invalid parameter: temperature must be between 20-100°C"),
            ConnectionError("Failed to connect to temperature controller"),
            RuntimeError("Experiment aborted due to safety interlock activation")
        ]
        
        for i, error in enumerate(errors, 1):
            success = await client.send_error_notification(
                experiment_id=f"exp_error_{i:03d}",
                error=error,
                context=f"Error occurred during step {i} of experiment"
            )
            
            if success:
                print(f"✓ Error notification {i} sent: {type(error).__name__}")


async def example_integration_patterns():
    """Example: Common integration patterns"""
    
    print("\n=== Integration Pattern Examples ===")
    
    # Pattern 1: Experiment lifecycle notifications
    experiment_id = "exp_pattern_001"
    
    async with N8NClient() as client:
        
        # Starting
        await client.send_custom_notification(
            "experiment-started",
            {
                "experiment_id": experiment_id,
                "status": "starting",
                "template": "automated_synthesis",
                "estimated_duration": "6 hours",
                "timestamp": datetime.utcnow().isoformat()
            },
            "experiment_lifecycle"
        )
        print("✓ Experiment start notification sent")
        
        # Progress updates (simulate)
        for progress in [25, 50, 75]:
            await client.send_custom_notification(
                "experiment-progress",
                {
                    "experiment_id": experiment_id,
                    "progress": progress,
                    "current_step": f"synthesis_step_{progress//25}",
                    "estimated_remaining": f"{(100-progress)*3.6} minutes",
                    "timestamp": datetime.utcnow().isoformat()
                },
                "experiment_progress"
            )
            print(f"✓ Progress update sent: {progress}%")
        
        # Completion
        await client.send_custom_notification(
            "experiment-completed",
            {
                "experiment_id": experiment_id,
                "status": "completed",
                "final_yield": "87.3%",
                "total_duration": "5.2 hours",
                "quality_score": "A+",
                "timestamp": datetime.utcnow().isoformat()
            },
            "experiment_lifecycle"
        )
        print("✓ Experiment completion notification sent")


def example_synchronous_usage():
    """Example: Synchronous usage (for non-async contexts)"""
    
    print("\n=== Synchronous Usage Examples ===")
    
    client = N8NClient()
    
    # Send simple notification synchronously
    success = client.send_notification_sync(
        "test-endpoint",
        {
            "message": "Test notification from synchronous context",
            "timestamp": datetime.utcnow().isoformat(),
            "source": "sync_example"
        },
        "sync_test"
    )
    
    if success:
        print("✓ Synchronous notification sent")
    else:
        print("✗ Synchronous notification failed")


async def example_advanced_configuration():
    """Example: Advanced configuration options"""
    
    print("\n=== Advanced Configuration Examples ===")
    
    # Custom configuration
    custom_config = {
        'timeout': 60,          # Longer timeout
        'retry_attempts': 5,    # More retries
        'retry_delay': 2        # Shorter delay between retries
    }
    
    async with N8NClient(custom_config=custom_config) as client:
        
        # High priority notification with custom config
        success = await client.send_custom_notification(
            "high-priority-alert",
            {
                "priority": "urgent",
                "message": "Critical system alert requiring immediate attention",
                "timestamp": datetime.utcnow().isoformat(),
                "escalation_level": 3
            },
            "priority_alert"
        )
        
        if success:
            print("✓ High priority notification sent with custom config")


async def main():
    """Run all examples"""
    
    print("N8N Connector Usage Examples")
    print("=" * 50)
    
    try:
        await example_experiment_notifications()
        await example_alert_notifications()
        await example_report_notifications()
        await example_custom_notifications()
        await example_error_handling()
        await example_integration_patterns()
        await example_advanced_configuration()
        
        # Synchronous example (doesn't need await)
        example_synchronous_usage()
        
        print("\n" + "=" * 50)
        print("All examples completed successfully!")
        
    except Exception as e:
        print(f"\nError running examples: {e}")
        print("Note: These examples require a running n8n instance or will use mock fallback")


if __name__ == "__main__":
    # Run the examples
    asyncio.run(main())