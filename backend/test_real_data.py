"""
Test script to validate real Muse EEG data processing.
"""

import sys
import logging
from data.loader import MuseDataLoader
from data.preprocessor import EEGPreprocessor
from scores.lri_calculator import LRICalculator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_data_loading():
    """Test loading participant data."""
    logger.info("=" * 60)
    logger.info("TEST 1: Data Loading")
    logger.info("=" * 60)

    loader = MuseDataLoader("../Muse EEG Subconscious Decisions Dataset")

    # Test single participant
    logger.info("\nLoading participant 0 (limited to first 10K rows)...")
    df = loader.load_participant(0, quality_filter=True, max_rows=10000)

    logger.info(f"✓ Loaded {len(df)} samples")
    logger.info(f"  Time range: {df['TimeStamp'].min()} to {df['TimeStamp'].max()}")
    logger.info(f"  Duration: {(df['TimeStamp'].max() - df['TimeStamp'].min()).total_seconds() / 60:.1f} minutes")

    # Check band power stats
    logger.info("\n  Band power averages:")
    for band in ['Delta', 'Theta', 'Alpha', 'Beta', 'Gamma']:
        band_cols = [col for col in df.columns if col.startswith(f'{band}_')]
        if band_cols:
            avg = df[band_cols].mean().mean()
            logger.info(f"    {band}: {avg:.3f}")

    return df


def test_windowing(df):
    """Test windowing system."""
    logger.info("\n" + "=" * 60)
    logger.info("TEST 2: Windowing")
    logger.info("=" * 60)

    preprocessor = EEGPreprocessor(sampling_rate=256.0)

    # Create 30-second windows with 50% overlap
    logger.info("\nCreating 30-second windows with 50% overlap...")
    windows = preprocessor.create_windows(df, window_seconds=30, overlap=0.5)

    logger.info(f"✓ Created {len(windows)} windows")
    if windows:
        logger.info(f"  Average samples per window: {sum(len(w) for w in windows) / len(windows):.0f}")
        logger.info(f"  Expected samples per window: {30 * 256} = {30 * 256}")

        # Show first window summary
        first_window = windows[0]
        summary = preprocessor.get_window_summary(first_window)
        logger.info(f"\n  First window summary:")
        logger.info(f"    Samples: {summary['n_samples']}")
        logger.info(f"    Duration: {summary['duration_seconds']:.1f}s")
        logger.info(f"    Start: {summary['start_time']}")

    return windows


def test_lri_calculation(windows):
    """Test LRI calculation on real data."""
    logger.info("\n" + "=" * 60)
    logger.info("TEST 3: LRI Calculation")
    logger.info("=" * 60)

    calculator = LRICalculator()

    # Calculate LRI for first 10 windows
    logger.info("\nCalculating LRI for first 10 windows...")
    lri_results = []

    for i, window in enumerate(windows[:10]):
        try:
            result = calculator.calculate_lri(window)
            lri_results.append(result)

            logger.info(f"\n  Window {i+1}:")
            logger.info(f"    LRI: {result['lri']:.1f}")
            logger.info(f"    Alertness: {result['alertness']:.1f}")
            logger.info(f"    Focus: {result['focus']:.1f}")
            logger.info(f"    Arousal Balance: {result['arousal_balance']:.1f}")
            logger.info(f"    Status: {result['status']}")

        except Exception as e:
            logger.error(f"  Window {i+1}: Failed - {e}")
            import traceback
            traceback.print_exc()

    if lri_results:
        avg_lri = sum(r['lri'] for r in lri_results) / len(lri_results)
        logger.info(f"\n✓ Successfully calculated LRI for {len(lri_results)} windows")
        logger.info(f"  Average LRI: {avg_lri:.1f}")
        logger.info(f"  LRI Range: {min(r['lri'] for r in lri_results):.1f} - {max(r['lri'] for r in lri_results):.1f}")

        # Check if values are realistic
        if 0 <= avg_lri <= 100:
            logger.info("  ✓ LRI values are within expected range (0-100)")
        else:
            logger.warning("  ⚠ LRI values outside expected range!")

    return lri_results


def test_full_pipeline():
    """Test complete pipeline with multiple participants."""
    logger.info("\n" + "=" * 60)
    logger.info("TEST 4: Full Pipeline")
    logger.info("=" * 60)

    from processors.real_data_processor import RealDataProcessor

    processor = RealDataProcessor("../Muse EEG Subconscious Decisions Dataset")

    logger.info("\nProcessing participant 0 (limited to 2 hours)...")
    try:
        result = processor.process_participant_sample(
            participant_id=0,
            max_hours=2.0,
            window_seconds=30
        )

        logger.info("\n✓ Pipeline completed successfully!")
        logger.info(f"  LRI samples: {len(result['lri_samples'])}")
        logger.info(f"  DNOS scores: {len(result['dnos_scores'])}")
        logger.info(f"  Days processed: {result['summary']['days_processed']}")
        logger.info(f"  Average LRI: {result['summary']['avg_lri']:.1f}")

        if result['dnos_scores']:
            avg_dnos = result['summary']['avg_dnos']
            logger.info(f"  Average DNOS: {avg_dnos:.1f}")

        if result['brain_score']:
            logger.info(f"  Brain Score: {result['brain_score']['brain_score']:.1f}")
        else:
            logger.info("  Brain Score: Not enough data (need 7+ days)")

        return result

    except Exception as e:
        logger.error(f"✗ Pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Run all tests."""
    logger.info("\n" + "=" * 60)
    logger.info("REAL MUSE EEG DATA VALIDATION")
    logger.info("=" * 60)

    try:
        # Test 1: Loading
        df = test_data_loading()

        # Test 2: Windowing
        windows = test_windowing(df)

        # Test 3: LRI Calculation
        lri_results = test_lri_calculation(windows)

        # Test 4: Full Pipeline
        pipeline_result = test_full_pipeline()

        # Summary
        logger.info("\n" + "=" * 60)
        logger.info("VALIDATION SUMMARY")
        logger.info("=" * 60)

        if df is not None and len(df) > 0:
            logger.info("✓ Data loading: PASS")
        else:
            logger.info("✗ Data loading: FAIL")

        if windows and len(windows) > 0:
            logger.info("✓ Windowing: PASS")
        else:
            logger.info("✗ Windowing: FAIL")

        if lri_results and len(lri_results) > 0:
            logger.info("✓ LRI calculation: PASS")
        else:
            logger.info("✗ LRI calculation: FAIL")

        if pipeline_result:
            logger.info("✓ Full pipeline: PASS")
        else:
            logger.info("✗ Full pipeline: FAIL")

        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Test suite failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
